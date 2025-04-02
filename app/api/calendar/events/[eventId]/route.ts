// File: app/api/calendar/events/[eventId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Database } from "@/lib/supabase/database.types"; // Adjust path as needed
import { authenticateApiRequest } from "@/lib/api-auth"; // Adjust path as needed

// Zod schema for validating updated event data
const updateEventSchema = z
	.object({
		title: z.string().min(1).optional(),
		description: z.string().optional().nullable(),
		start_time: z.string().datetime().optional(),
		end_time: z.string().datetime().optional(),
		is_all_day: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// NOTE: Removed explicit handler types and ApiContext due to persistent build error.
// Using 'any' for context as a temporary workaround.

/**
 * PUT handler to update an existing calendar event.
 * RLS policies handle authorization.
 */
export const PUT = async (
	request: NextRequest,
	// WORKAROUND: Using 'any' type for context to bypass build error.
	// WARNING: This sacrifices type safety for context.params.eventId.
	context: any
) => {
	// Use your authentication helper
	const authResult = await authenticateApiRequest();

	// Check if authentication failed
	if (!authResult.authenticated || !authResult.supabase || !authResult.userId) {
		return (authResult.response as any) instanceof NextResponse ||
			(authResult.response as any) instanceof Response
			? authResult.response
			: NextResponse.json({ error: "Authentication failed" }, { status: 500 });
	}

	// Get the authenticated Supabase client
	const supabase = authResult.supabase;

	// Safely access eventId from context with runtime check
	const eventId = context?.params?.eventId;
	if (!eventId || !z.string().uuid().safeParse(eventId).success) {
		return NextResponse.json(
			{ error: "Invalid or missing event ID" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const validation = updateEventSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validation.error.errors },
				{ status: 400 }
			);
		}

		const updateData = {
			...validation.data,
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("calendar_events")
			.update(updateData)
			.eq("id", eventId) // Use validated eventId
			.select()
			.single();

		if (error) {
			console.error("Error updating event:", error);
			if (error.code === "PGRST116") {
				const { count } = await supabase
					.from("calendar_events")
					.select("id", { count: "exact", head: true })
					.eq("id", eventId);
				if (count === 0) {
					return NextResponse.json(
						{ error: "Event not found" },
						{ status: 404 }
					);
				} else {
					return NextResponse.json(
						{ error: "Permission denied to update this event" },
						{ status: 403 }
					);
				}
			}
			return NextResponse.json(
				{ error: "Failed to update event", details: error.message },
				{ status: 500 }
			);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Event not found or permission denied" },
				{ status: 404 }
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		console.error("Error processing request:", err);
		if (err instanceof SyntaxError && err.message.includes("JSON")) {
			return NextResponse.json(
				{ error: "Invalid JSON in request body" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}; // End PUT handler

/**
 * DELETE handler to remove a calendar event.
 * RLS policies handle authorization.
 */
export const DELETE = async (
	request: NextRequest,
	// WORKAROUND: Using 'any' type for context to bypass build error.
	// WARNING: This sacrifices type safety for context.params.eventId.
	context: any
) => {
	// Use your authentication helper
	const authResult = await authenticateApiRequest();

	// Check if authentication failed
	if (!authResult.authenticated || !authResult.supabase || !authResult.userId) {
		return (authResult.response as any) instanceof NextResponse ||
			(authResult.response as any) instanceof Response
			? authResult.response
			: NextResponse.json({ error: "Authentication failed" }, { status: 500 });
	}

	// Get the authenticated Supabase client
	const supabase = authResult.supabase;

	// Safely access eventId from context with runtime check
	const eventId = context?.params?.eventId;
	if (!eventId || !z.string().uuid().safeParse(eventId).success) {
		return NextResponse.json(
			{ error: "Invalid or missing event ID" },
			{ status: 400 }
		);
	}

	try {
		const { error, count } = await supabase
			.from("calendar_events")
			.delete({ count: "exact" })
			.eq("id", eventId); // Use validated eventId

		if (error) {
			console.error("Error deleting event:", error);
			return NextResponse.json(
				{ error: "Failed to delete event", details: error.message },
				{ status: 500 }
			);
		}

		if (count === 0) {
			// Event not found or RLS prevented deletion
			const { count: existsCount } = await supabase
				.from("calendar_events")
				.select("id", { count: "exact", head: true })
				.eq("id", eventId);
			if (existsCount === 0) {
				return NextResponse.json({ error: "Event not found" }, { status: 404 });
			} else {
				return NextResponse.json(
					{ error: "Permission denied to delete this event" },
					{ status: 403 }
				);
			}
		}

		return NextResponse.json(
			{ message: "Event deleted successfully" },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Error processing request:", err);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}; // End DELETE handler
