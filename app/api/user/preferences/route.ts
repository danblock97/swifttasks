// File: app/api/user/preferences/route.ts
// NOTE: Only the PUT handler is shown with corrections. GET remains the same.

import { NextResponse } from "next/server";
import { z } from "zod";
import {
	Database,
	CalendarReminderPreferences,
	DbUser,
	Json,
} from "@/lib/supabase/database.types"; // Adjust path
import { authenticateApiRequest } from "@/lib/api-auth"; // Adjust path

// Zod schema for validating calendar reminder preferences (Simplified)
const calendarReminderSchema = z.object({
	// No 'enabled' field here anymore
	frequency: z.enum(["none", "on_day", "1_day_before"]),
});

// Zod schema for the overall preferences update
// Include other preference fields you might have
const updatePreferencesSchema = z.object({
	darkMode: z.boolean().optional(),
	notificationsEnabled: z.boolean().optional(), // Assuming general notifications key
	defaultView: z.enum(["list", "kanban", "calendar"]).optional(),
	tasksSortOrder: z.enum(["due_date", "priority", "created_at"]).optional(),
	// calendar_reminders object itself is optional in the request,
	// but if present, it must match its schema (just frequency)
	calendar_reminders: calendarReminderSchema.optional(),
});

/**
 * PUT handler to update user preferences.
 * Merges new preferences with existing ones.
 */
export async function PUT(request: Request) {
	// Use your authentication helper
	const authResult = await authenticateApiRequest();

	// Check if authentication failed
	if (!authResult.authenticated || !authResult.supabase || !authResult.userId) {
		return (
			authResult.response ??
			NextResponse.json({ error: "Authentication failed" }, { status: 500 })
		);
	}

	// Get the authenticated Supabase client and user ID
	const supabase = authResult.supabase;
	const userId = authResult.userId;

	try {
		const body = await request.json();
		const validation = updatePreferencesSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validation.error.errors },
				{ status: 400 }
			);
		}

		// Fetch current preferences directly
		const { data: currentProfile, error: profileError } = await supabase
			.from("users")
			.select("preferences") // Select only preferences
			.eq("id", userId)
			.single();

		if (profileError && profileError.code !== "PGRST116") {
			// Ignore 'not found' error, handle below
			console.error(
				"Error fetching current profile for preferences update:",
				profileError
			);
			return NextResponse.json(
				{ error: "Failed to fetch current user data" },
				{ status: 500 }
			);
		}

		const currentPreferences = (currentProfile?.preferences ||
			{}) as DbUser["preferences"];

		// --- Corrected Merge Logic ---
		// Simply spread current preferences, then spread the validated update data.
		// If validation.data contains 'calendar_reminders', it will overwrite
		// the existing 'calendar_reminders' object entirely.
		const newPreferences = {
			...currentPreferences,
			...validation.data,
		};
		// --- End Corrected Merge Logic ---

		// Optional: Remove undefined keys (good practice)
		Object.keys(newPreferences).forEach(
			(key) =>
				newPreferences[key as keyof typeof newPreferences] === undefined &&
				delete newPreferences[key as keyof typeof newPreferences]
		);

		const { data, error } = await supabase
			.from("users")
			.update({ preferences: newPreferences as Json }) // Cast to Json for Supabase update
			.eq("id", userId)
			.select("preferences") // Select the updated preferences
			.single();

		if (error) {
			console.error("Error updating preferences:", error);
			return NextResponse.json(
				{ error: "Failed to update preferences", details: error.message },
				{ status: 500 }
			);
		}

		// Return the newly saved preferences object
		return NextResponse.json(data?.preferences || {}, { status: 200 });
	} catch (err) {
		console.error("Error processing request:", err);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}

// GET handler remains the same...
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
	try {
		const { data, error } = await supabase
			.from("users")
			.select("preferences")
			.eq("id", userId)
			.single();
		if (error) {
			console.error("Error fetching preferences:", error);
			if (error.code === "PGRST116") {
				return NextResponse.json({}, { status: 200 });
			}
			return NextResponse.json(
				{ error: "Failed to fetch preferences", details: error.message },
				{ status: 500 }
			);
		}
		return NextResponse.json(data?.preferences || {}, { status: 200 });
	} catch (err) {
		console.error("Error processing request:", err);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
