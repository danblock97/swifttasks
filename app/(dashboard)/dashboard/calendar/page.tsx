// File: app/(dashboard)/calendar/page.tsx
// This assumes your dashboard layout is handled by a layout file in app/(dashboard)/layout.tsx

import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/lib/supabase/database.types"; // Adjust path
import { CalendarView } from "@/components/calendar/calendar-view"; // Adjust path

export default async function CalendarPage() {
	const supabase = createServerComponentClient<Database>({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/login"); // Redirect to login if not authenticated
	}

	// You could potentially fetch initial user/team data here if needed by CalendarView directly
	// but CalendarView currently fetches its own data based on range.

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mt-6">
				{/* Render the client component responsible for the calendar logic */}
				<CalendarView />
			</div>
		</div>
	);
}
