// File: app/api/calendar/events/route.ts

// import { createServerActionClient } from '@supabase/auth-helpers-nextjs'; // No longer needed directly here
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Database, DbUser } from "@/lib/supabase/database.types"; // Adjust path as needed
// Use the correct authentication function from your file
import { authenticateApiRequest } from "@/lib/api-auth"; // Adjust path as needed

// Zod schema for validating new event data
const createEventSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional().nullable(),
	start_time: z.string().datetime({ message: "Invalid start date format" }),
	end_time: z.string().datetime({ message: "Invalid end date format" }),
	is_all_day: z.boolean().optional().default(false),
});

/**
 * POST handler to create a new calendar event.
 * Differentiates between personal and team events based on user's profile.
 */
export async function POST(request: Request) {
	// Use your authentication helper
	const authResult = await authenticateApiRequest();

	// Check if authentication failed
	if (!authResult.authenticated || !authResult.supabase || !authResult.userId) {
		// If response object exists (e.g., 401 Unauthorized), return it
		// Otherwise, return a generic 500 error
		return (
			authResult.response ??
			NextResponse.json({ error: "Authentication failed" }, { status: 500 })
		);
	}

	// Get the authenticated Supabase client and user ID
	const supabase = authResult.supabase;
	const userId = authResult.userId;

	// Fetch user profile data directly using the authenticated client
	const { data: profile, error: profileError } = await supabase
		.from("users")
		.select("team_id, account_type") // Select only needed fields
		.eq("id", userId)
		.single();

	if (profileError || !profile) {
		console.error("Error fetching profile:", profileError);
		// Use DbUser type for profile data
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 }
		);
	}

	try {
		const body = await request.json();
		const validation = createEventSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validation.error.errors },
				{ status: 400 }
			);
		}

		const { title, description, start_time, end_time, is_all_day } =
			validation.data;

		// Determine if it's a personal or team event based on fetched profile
		const isTeamEvent =
			profile.team_id && profile.account_type === "team_member";

		const newEventData: Database["public"]["Tables"]["calendar_events"]["Insert"] =
			{
				title,
				description,
				start_time,
				end_time,
				is_all_day,
				created_by: userId, // Use the authenticated user ID
				user_id: isTeamEvent ? null : userId, // Set user_id only for personal events
				team_id: isTeamEvent ? profile.team_id : null, // Set team_id only for team events
			};

		const { data, error } = await supabase
			.from("calendar_events")
			.insert(newEventData)
			.select()
			.single();

		if (error) {
			console.error("Error creating event:", error);
			if (error.code === "42501") {
				return NextResponse.json(
					{ error: "Permission denied to create this event." },
					{ status: 403 }
				);
			}
			return NextResponse.json(
				{ error: "Failed to create event", details: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		console.error("Error processing request:", err);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
