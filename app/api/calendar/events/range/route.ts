// File: app/api/calendar/events/range/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
// Import specific Db types as needed
import {
	Database,
	DbCalendarEvent,
	DbTodoItem,
	DbBoardItem,
	DbUser,
} from "@/lib/supabase/database.types"; // Added DbBoardItem
import { authenticateApiRequest } from "@/lib/api-auth"; // Adjust path as needed
import { parseISO, endOfDay, startOfDay, isValid } from "date-fns"; // Import date-fns functions

// Zod schema for validating query parameters
const rangeQuerySchema = z.object({
	start: z.string().datetime({ message: "Invalid start date format" }),
	end: z.string().datetime({ message: "Invalid end date format" }),
});

// Updated Type: Added 'project_task'
export type CalendarItem = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	resource?: any; // Optional: Store original event/todo data for editing/details
	type: "event" | "todo" | "project_task"; // Added project_task type
	description?: string | null;
	team_id?: string | null;
	user_id?: string | null; // Owner/Assignee/Creator context
	created_by?: string; // Event creator specifically
};

/**
 * GET handler to fetch calendar items based on user type (single/team).
 * Single User: Events + Todos + Personal Project Tasks
 * Team Member: Events + Team Project Tasks
 */
export async function GET(request: Request) {
	const authResult = await authenticateApiRequest();

	if (!authResult.authenticated || !authResult.supabase || !authResult.userId) {
		return (
			authResult.response ??
			NextResponse.json({ error: "Authentication failed" }, { status: 500 })
		);
	}

	const supabase = authResult.supabase;
	const userId = authResult.userId;

	const { data: profile, error: profileError } = await supabase
		.from("users")
		.select("team_id, account_type")
		.eq("id", userId)
		.single();

	if (profileError || !profile) {
		console.error("Error fetching profile:", profileError);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 }
		);
	}

	const { searchParams } = new URL(request.url);

	const validation = rangeQuerySchema.safeParse({
		start: searchParams.get("start"),
		end: searchParams.get("end"),
	});

	if (!validation.success) {
		return NextResponse.json(
			{ error: "Invalid query parameters", details: validation.error.errors },
			{ status: 400 }
		);
	}

	const { start: startDateStr, end: endDateStr } = validation.data;
	const isTeamMember = !!profile.team_id; // Check if user is part of a team

	try {
		// --- Fetch Calendar Events (Always fetched) ---
		const { data: eventsData, error: eventsError } = await supabase
			.from("calendar_events")
			.select("*")
			.lt("start_time", endDateStr)
			.gt("end_time", startDateStr); // RLS filters apply

		if (eventsError)
			throw new Error(
				`Failed to fetch calendar events: ${eventsError.message}`
			);

		const calendarEvents: CalendarItem[] = (eventsData || []).map(
			(event: DbCalendarEvent) => ({
				id: `event-${event.id}`,
				title: event.title,
				start: parseISO(event.start_time),
				end: parseISO(event.end_time),
				allDay: event.is_all_day,
				resource: event,
				type: "event",
				description: event.description,
				team_id: event.team_id,
				user_id: event.user_id,
				created_by: event.created_by,
			})
		);

		// --- Initialize arrays for conditional items ---
		let todoEvents: CalendarItem[] = [];
		let boardEvents: CalendarItem[] = [];

		// --- Fetch Todos (Only for Single Users) ---
		if (!isTeamMember) {
			// 1. Get IDs of accessible todo_lists
			const { data: listsData, error: listsError } = await supabase
				.from("todo_lists")
				.select("id")
				.eq("owner_id", userId)
				.is("team_id", null);

			if (listsError)
				throw new Error(
					`Failed to determine accessible todo lists: ${listsError.message}`
				);
			const accessibleListIds = (listsData || []).map((list) => list.id);

			// 2. Fetch relevant todo_items
			if (accessibleListIds.length > 0) {
				const { data: todosData, error: todosError } = await supabase
					.from("todo_items")
					.select("id, content, due_date, list_id")
					.in("list_id", accessibleListIds)
					.not("due_date", "is", null)
					.gte("due_date", startDateStr.substring(0, 10))
					.lte("due_date", endDateStr.substring(0, 10));

				if (todosError)
					throw new Error(`Failed to fetch todo items: ${todosError.message}`);

				// Use .reduce() to filter, parse, validate, and map in one step
				todoEvents = (todosData || []).reduce((acc: CalendarItem[], todo) => {
					// Check if due_date is null or empty string (shouldn't be due to .not filter, but belt-and-suspenders)
					if (!todo.due_date) {
						return acc; // Skip if no due date string
					}
					// Parse the date
					const dueDate = parseISO(todo.due_date); // No assertion needed yet

					// Check if the parsed date is valid
					if (isValid(dueDate)) {
						// If valid, create and push the CalendarItem
						acc.push({
							id: `todo-${todo.id}`,
							title: `Todo: ${todo.content}`,
							start: startOfDay(dueDate),
							end: endOfDay(dueDate),
							allDay: true,
							resource: todo, // Store original data
							type: "todo",
							description: null,
							team_id: null,
							user_id: userId,
						});
					} else {
						// Log invalid dates if needed
						console.warn(
							`Invalid due_date found for todo item ${todo.id}: ${todo.due_date}`
						);
					}
					return acc; // Return accumulator for the next iteration
				}, []); // Initialize accumulator as empty CalendarItem array
			}
		}

		// --- Fetch Board Items (Project Tasks) ---
		// 1. Get Accessible Project IDs
		let projectQuery = supabase.from("projects").select("id");
		if (isTeamMember) {
			projectQuery = projectQuery.eq("team_id", profile.team_id!);
		} else {
			projectQuery = projectQuery.eq("owner_id", userId).is("team_id", null);
		}
		const { data: projectsData, error: projectsError } = await projectQuery;
		if (projectsError)
			throw new Error(
				`Failed to fetch accessible projects: ${projectsError.message}`
			);
		const accessibleProjectIds = (projectsData || []).map((p) => p.id);

		// 2. Get Board IDs
		let accessibleBoardIds: string[] = [];
		if (accessibleProjectIds.length > 0) {
			const { data: boardsData, error: boardsError } = await supabase
				.from("boards")
				.select("id")
				.in("project_id", accessibleProjectIds);
			if (boardsError)
				throw new Error(`Failed to fetch boards: ${boardsError.message}`);
			accessibleBoardIds = (boardsData || []).map((b) => b.id);
		}

		// 3. Get Column IDs
		let accessibleColumnIds: string[] = [];
		if (accessibleBoardIds.length > 0) {
			const { data: columnsData, error: columnsError } = await supabase
				.from("board_columns")
				.select("id")
				.in("board_id", accessibleBoardIds);
			if (columnsError)
				throw new Error(
					`Failed to fetch board columns: ${columnsError.message}`
				);
			accessibleColumnIds = (columnsData || []).map((c) => c.id);
		}

		// 4. Fetch board_items
		if (accessibleColumnIds.length > 0) {
			const { data: boardItemsData, error: boardItemsError } = await supabase
				.from("board_items")
				.select("id, title, description, due_date, column_id, assigned_to")
				.in("column_id", accessibleColumnIds)
				.not("due_date", "is", null)
				.gte("due_date", startDateStr.substring(0, 10))
				.lte("due_date", endDateStr.substring(0, 10));

			if (boardItemsError)
				throw new Error(
					`Failed to fetch board items: ${boardItemsError.message}`
				);

			// Use .reduce() to filter, parse, validate, and map in one step
			boardEvents = (boardItemsData || []).reduce(
				(acc: CalendarItem[], item) => {
					// Check if due_date is null or empty string
					if (!item.due_date) {
						return acc; // Skip
					}
					// Parse the date
					const dueDate = parseISO(item.due_date); // No assertion needed yet

					// Check if the parsed date is valid
					if (isValid(dueDate)) {
						// If valid, create and push the CalendarItem
						acc.push({
							id: `task-${item.id}`,
							title: `Task: ${item.title}`,
							start: startOfDay(dueDate),
							end: endOfDay(dueDate),
							allDay: true,
							resource: item, // Store original data
							type: "project_task",
							description: item.description,
							team_id: isTeamMember ? profile.team_id : null,
							user_id: item.assigned_to ?? (isTeamMember ? null : userId),
						});
					} else {
						// Log invalid dates if needed
						console.warn(
							`Invalid due_date found for board item ${item.id}: ${item.due_date}`
						);
					}
					return acc; // Return accumulator
				},
				[]
			); // Initialize accumulator
		}
		// --- End Board Items Fetch ---

		// Combine results based on user type
		const combinedItems = isTeamMember
			? [...calendarEvents, ...boardEvents] // Team: Events + Project Tasks
			: [...calendarEvents, ...todoEvents, ...boardEvents]; // Single: Events + Todos + Project Tasks

		return NextResponse.json(combinedItems, { status: 200 });
	} catch (err) {
		console.error("Error processing range request:", err);
		const message =
			err instanceof Error ? err.message : "An unexpected error occurred";
		return NextResponse.json(
			{ error: "Failed to process calendar range request", details: message },
			{ status: 500 }
		);
	}
}
