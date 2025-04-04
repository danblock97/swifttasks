// File: components/calendar/calendar-view.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Calendar,
	dateFnsLocalizer,
	Views,
	View,
	NavigateAction,
	EventProps,
} from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";

import {
	add,
	startOfMonth,
	endOfMonth,
	startOfDay,
	endOfDay,
	parseISO,
	isValid,
} from "date-fns";
import { useToast } from "@/hooks/use-toast"; // Adjust path as needed
// Assuming EventForm is now the non-shadcn version
import { EventForm } from "./event-form"; // Adjust path as needed
// Import type from API route (uses 'event' | 'todo')
import { CalendarItem } from "@/app/api/calendar/events/range/route";
import { Loader2 } from "lucide-react";

// Setup the localizer by providing the required date-fns functions
const locales = {
	"en-US": enUS,
};
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { locale: locales["en-US"] }),
	getDay,
	locales,
});

// Define responsive format options for different screens
const formats = {
	dayFormat: (date: Date, culture: string = "en-US") => {
		// For mobile screens, use shorter formats
		if (typeof window !== "undefined" && window.innerWidth < 480) {
			return format(date, "ccc", { locale: locales[culture as keyof typeof locales] });
		}
		return format(date, "EEE", { locale: locales[culture as keyof typeof locales] });
	},
	timeGutterFormat: (date: Date) => {
		// For mobile screens, use shorter time formats
		if (typeof window !== "undefined" && window.innerWidth < 480) {
			return format(date, "h a");
		}
		return format(date, "h:mm a");
	},
};

// Define the structure for selected slot info
interface SelectedSlotInfo {
	start: Date;
	end: Date;
	slots?: Date[];
	action: "select" | "click" | "doubleClick";
}

export function CalendarView() {
	const { toast } = useToast();
	const [events, setEvents] = useState<CalendarItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	
	// Set default view based on screen size
	const [currentView, setCurrentView] = useState<View>(() => {
		// Use agenda view on mobile by default (better for small screens)
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return Views.AGENDA;
		}
		return Views.MONTH;
	});

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(
		null
	);

	// Fetch events based on the current date range and view
	const fetchEvents = useCallback(
		async (startDate: Date, endDate: Date) => {
			setLoading(true);
			try {
				const startStr = startDate.toISOString();
				const endStr = endDate.toISOString();

				const response = await fetch(
					`/api/calendar/events/range?start=${startStr}&end=${endStr}`
				);
				if (!response.ok) {
					const errorData = await response.json();
					// Throw the specific error from the API if available
					throw new Error(errorData.error || "Failed to fetch calendar data");
				}
				const data: any[] = await response.json(); // Use any[] initially

				// Convert date strings back to Date objects and ensure type safety
				const formattedEvents: CalendarItem[] = data.map((item: any) => ({
					...item,
					// Ensure start/end are parsed correctly, provide fallback if invalid
					// Now isValid can be used here
					start:
						item.start && isValid(parseISO(item.start))
							? parseISO(item.start)
							: new Date(),
					end:
						item.end && isValid(parseISO(item.end))
							? parseISO(item.end)
							: new Date(),
					// Ensure type is one of the expected values
					type:
						item.type === "event" || item.type === "todo" ? item.type : "event", // Default to 'event' if type is unexpected
				}));

				setEvents(formattedEvents);
			} catch (error: any) {
				console.error("Error fetching calendar data:", error);
				toast({
					title: "Error Loading Calendar",
					// Display the specific error message caught from the fetch/API
					description: error.message || "Could not load events.",
					variant: "destructive",
				});
				setEvents([]);
			} finally {
				setLoading(false);
			}
		},
		[toast]
	); // Removed dateRange from dependencies here, fetch is triggered by useEffect below

	// Calculate the date range for the current view
	const dateRange = useMemo(() => {
		let start: Date;
		let end: Date;
		const baseDate = startOfDay(currentDate); // Use start of day for consistency

		switch (currentView) {
			case Views.MONTH:
				start = startOfWeek(startOfMonth(baseDate), {
					locale: locales["en-US"],
				});
				end = add(start, { weeks: 6 }); // Fetch 6 weeks for month view display
				break;
			case Views.WEEK:
				start = startOfWeek(baseDate, { locale: locales["en-US"] });
				end = add(start, { days: 7 }); // Fetch full week + 1 day buffer
				break;
			case Views.DAY:
				start = baseDate;
				end = add(start, { days: 1 }); // Fetch 1 day + 1 day buffer
				break;
			case Views.AGENDA:
				start = startOfMonth(baseDate);
				end = endOfMonth(baseDate);
				// Optionally add buffer for agenda view as well
				// start = add(start, { days: -7 });
				// end = add(end, { days: 7 });
				break;
			default: // Default to month view range calculation
				start = startOfWeek(startOfMonth(baseDate), {
					locale: locales["en-US"],
				});
				end = add(start, { weeks: 6 });
		}
		// Ensure range covers full days
		return { start: startOfDay(start), end: endOfDay(add(end, { days: -1 })) }; // Use end of the *last* day in the range
	}, [currentDate, currentView]);

	// Fetch events when the date range changes
	useEffect(() => {
		fetchEvents(dateRange.start, dateRange.end);
	}, [dateRange, fetchEvents]); // Depend on calculated dateRange

	// Handlers for react-big-calendar interactions
	const handleSelectEvent = useCallback(
		(event: CalendarItem) => {
			// Corrected: Check for 'todo' type instead of 'task'
			if (event.type === "todo") {
				// Optionally show todo details in a read-only modal or navigate
				toast({
					title: "Todo Item Selected",
					description: `Item: ${event.title.replace("Todo: ", "")}`,
				});
				return; // Don't open edit form for todos
			}
			// Only allow editing 'event' types
			setSelectedEvent(event);
			setSelectedSlot(null);
			setIsModalOpen(true);
		},
		[toast]
	);

	const handleSelectSlot = useCallback((slotInfo: SelectedSlotInfo) => {
		// Prevent opening create modal if clicking on a background event (like all-day slot header)
		if (
			slotInfo.action === "click" &&
			slotInfo.slots &&
			slotInfo.slots.length <= 1
		) {
			// Check if the click was on a "more" link or similar background element if needed
			// For now, allow creating on single slot click/drag
		}
		setSelectedEvent(null);
		setSelectedSlot(slotInfo);
		setIsModalOpen(true);
	}, []);

	const handleNavigate = useCallback(
		(newDate: Date, view: View, action: NavigateAction) => {
			setCurrentDate(newDate);
			// View change is handled by handleView
		},
		[]
	);

	const handleView = useCallback((newView: View) => {
		setCurrentView(newView);
	}, []);

	// Close modal and refresh data
	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedEvent(null);
		setSelectedSlot(null);
	};

	const handleModalSave = () => {
		// Re-fetch events after saving
		fetchEvents(dateRange.start, dateRange.end);
		// Modal is closed by the EventForm itself on success
	};

	// Custom Event component (optional styling)
	const CustomEvent: React.FC<EventProps<CalendarItem>> = ({ event }) => {
		// Corrected: Check for 'todo' type
		const isTodo = event.type === "todo";
		return (
			<div className={isTodo ? "opacity-80 italic" : ""} title={event.title}>
				{" "}
				{/* Add title attribute */}
				<strong>{event.title}</strong>
				{event.description && (
					<p className="text-xs truncate">{event.description}</p>
				)}
			</div>
		);
	};

	return (
		<div className="relative h-[60vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh] p-2 sm:p-4 bg-card rounded-lg shadow border border-border">
			{loading && (
				<div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				allDayAccessor="allDay" // Ensure allDayAccessor is set
				style={{ height: "100%" }}
				views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
				view={currentView}
				date={currentDate}
				onNavigate={handleNavigate}
				onView={handleView}
				onSelectEvent={handleSelectEvent}
				onSelectSlot={handleSelectSlot}
				selectable={true}
				popup={true} // Use popup for month view overflow
				components={{
					event: CustomEvent, // Use custom event rendering
				}}
				// Style events based on type using eventPropGetter
				eventPropGetter={(event) => {
					// Corrected: Check for 'todo' type
					const isTodo = event.type === "todo";
					return {
						className: isTodo ? "rbc-event-task" : "rbc-event-default", // Use classes defined in globals.css
						// style object can also be used but className is often cleaner with CSS overrides
						// style: {
						//     backgroundColor: isTodo ? '#a3e635' : '#3b82f6', // Example direct styles
						//     borderColor: isTodo ? '#65a30d' : '#1d4ed8',
						// },
					};
				}}
				// Consider adding formats if needed
				formats={formats}
			/>

			{/* Event Form Modal (using non-shadcn version) */}
			<EventForm
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onSave={handleModalSave}
				event={selectedEvent}
				initialDate={selectedSlot?.start ?? null}
			/>
		</div>
	);
}
