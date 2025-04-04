// File: components/calendar/event-form.tsx (Check Button/Slot)
// No code changes here, the structure is likely correct.
// The error suggests checking the implementation of the Button component
// and ensuring @radix-ui/react-slot is installed correctly.
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
// Import Controller from react-hook-form
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
// Import necessary date-fns functions
import {
	format,
	parse,
	parseISO,
	isValid,
	setHours,
	setMinutes,
	startOfDay,
} from "date-fns";
import { Trash2, Loader2, X, CalendarIcon, Clock } from "lucide-react"; // Added Clock icon

// Import Popover components (assuming path)
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
// Import your custom Calendar component (assuming path)
import { Calendar } from "@/components/ui/calendar";
// Import Button component (assuming path - CHECK THIS COMPONENT'S IMPLEMENTATION)
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DbCalendarEvent } from "@/lib/supabase/database.types";
import { CalendarItem } from "@/app/api/calendar/events/range/route";

// Zod schema updated: is_all_day is now just z.boolean()
const eventFormSchema = z
	.object({
		title: z.string().min(1, { message: "Title is required" }),
		description: z.string().optional().nullable(),
		start_time: z.date({ required_error: "Start date & time are required." }),
		end_time: z.date({ required_error: "End date & time are required." }),
		// Simplified: Rely on useForm's defaultValues for initial state
		is_all_day: z.boolean(),
	})
	.refine(
		(data) => {
			// If it's an all-day event, time comparison might not matter as much,
			// but ensure end date is not before start date.
			// If not all-day, ensure end time is not before start time.
			if (data.is_all_day) {
				return startOfDay(data.end_time) >= startOfDay(data.start_time);
			}
			return data.end_time >= data.start_time;
		},
		{
			message: "End date/time cannot be before start date/time",
			path: ["end_time"], // Attach error to end_time field
		}
	);

// Infer TypeScript type from the Zod schema
type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	event?: CalendarItem | null;
	initialDate?: Date | null;
}

export function EventForm({
	isOpen,
	onClose,
	onSave,
	event,
	initialDate,
}: EventFormProps) {
	const { toast } = useToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isEditing = !!event && event.type === "event";
	const eventId = isEditing ? event.id.replace("event-", "") : null;

	// Initialize react-hook-form - Restore generic type <EventFormData>
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		control,
		watch,
		setValue,
	} = useForm<EventFormData>({
		// Restore generic
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: "",
			description: "",
			start_time: initialDate ? startOfDay(initialDate) : new Date(),
			end_time: initialDate ? startOfDay(initialDate) : new Date(),
			is_all_day: false, // Explicitly set default boolean value here
		},
	});

	// Helper to safely parse date strings/objects
	const parseEventDate = (
		dateInput: Date | string | null | undefined
	): Date => {
		/* ... */ const fallbackDate = new Date();
		if (!dateInput) return fallbackDate;
		try {
			const parsed =
				typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
			return isValid(parsed) ? parsed : fallbackDate;
		} catch {
			return fallbackDate;
		}
	};

	// Effect to reset form values
	useEffect(() => {
		/* ... */ let defaultStartTime = initialDate
			? startOfDay(initialDate)
			: new Date();
		let defaultEndTime = defaultStartTime;
		let defaultTitle = "";
		let defaultDesc = "";
		let defaultAllDay = false;
		if (isEditing && event?.resource) {
			const resource = event.resource as DbCalendarEvent;
			defaultStartTime = parseEventDate(resource.start_time);
			defaultEndTime = parseEventDate(resource.end_time);
			defaultTitle = resource.title || "";
			defaultDesc = resource.description || "";
			defaultAllDay = resource.is_all_day ?? false;
		} else if (initialDate) {
			defaultStartTime = setHours(
				setMinutes(startOfDay(initialDate), 0),
				new Date().getHours()
			);
			defaultEndTime = addHours(defaultStartTime, 1);
		}
		reset({
			title: defaultTitle,
			description: defaultDesc,
			start_time: defaultStartTime,
			end_time: defaultEndTime,
			is_all_day: defaultAllDay,
		});
	}, [event, isEditing, initialDate, reset]);

	// onSubmit function
	const onSubmit = async (values: EventFormData) => {
		/* ... */ const apiUrl = isEditing
			? `/api/calendar/events/${eventId}`
			: "/api/calendar/events";
		const method = isEditing ? "PUT" : "POST";
		const payload = {
			title: values.title,
			description: values.description,
			start_time: values.start_time.toISOString(),
			end_time: values.end_time.toISOString(),
			is_all_day: values.is_all_day,
		};
		try {
			const response = await fetch(apiUrl, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						`Failed to ${isEditing ? "update" : "create"} event`
				);
			}
			toast({
				title: `Event ${isEditing ? "updated" : "created"} successfully!`,
			});
			onSave();
			handleClose();
		} catch (error: any) {
			console.error(
				`Error ${isEditing ? "updating" : "creating"} event:`,
				error
			);
			toast({
				title: `Error ${isEditing ? "updating" : "creating"} event`,
				description: error.message || "An unexpected error occurred.",
				variant: "destructive",
			});
		}
	};

	// handleDelete and handleClose remain the same...
	const handleDelete = async () => {
		/* ... */ if (!eventId) return;
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/calendar/events/${eventId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete event");
			}
			toast({ title: "Event deleted successfully!" });
			onSave();
			handleClose();
		} catch (error: any) {
			console.error("Error deleting event:", error);
			toast({
				title: "Error deleting event",
				description: error.message || "An unexpected error occurred.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};
	const handleClose = () => {
		reset();
		setShowDeleteConfirm(false);
		onClose();
	};

	if (!isOpen) {
		return null;
	}

	// Watch the all day flag
	const isAllDay = watch("is_all_day");

	return (
		<>
			{/* Modal Backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
				onClick={showDeleteConfirm ? undefined : handleClose}
			></div>
			{/* Modal Content Wrapper */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
				{/* Modal Panel */}
				<div className="relative w-full max-w-md bg-card text-card-foreground rounded-lg shadow-xl border border-border max-h-[90vh] overflow-y-auto">
					{/* Close Button */}
					<button
						onClick={handleClose}
						className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
						aria-label="Close dialog"
					>
						{" "}
						<X className="h-5 w-5" />{" "}
					</button>
					{/* Modal Body */}
					<div className="p-6">
						<h2 className="text-lg font-semibold mb-4">
							{" "}
							{isEditing ? "Edit Event" : "Create New Event"}{" "}
						</h2>
						{/* Form Element */}
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							{/* Title Field */}
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium mb-1 text-foreground"
								>
									Title *
								</label>
								<input
									id="title"
									type="text"
									{...register("title")}
									placeholder="e.g., Team Meeting"
									className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
								/>
								{errors.title && (
									<p className="text-sm text-red-600 mt-1">
										{errors.title.message}
									</p>
								)}
							</div>
							{/* Description Field */}
							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium mb-1 text-foreground"
								>
									Description
								</label>
								<textarea
									id="description"
									{...register("description")}
									rows={3}
									placeholder="Optional details..."
									className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder:text-muted-foreground resize-none"
								/>
								{errors.description && (
									<p className="text-sm text-red-600 mt-1">
										{errors.description.message}
									</p>
								)}
							</div>

							{/* Start Date & Time Fields */}
							<div className="grid grid-cols-2 gap-3">
								{/* Start Date */}
								<div>
									<label className="block text-sm font-medium mb-1 text-foreground">
										Start Date *
									</label>
									<Controller
										name="start_time"
										control={control}
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													{/* Ensure this Button component handles asChild correctly */}
													<Button
														variant={"outline"}
														className={cn(
															"w-full justify-start text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={(date) => {
															if (!date) return;
															const currentTime = field.value || new Date();
															const newDateTime = setHours(
																setMinutes(
																	startOfDay(date),
																	currentTime.getMinutes()
																),
																currentTime.getHours()
															);
															field.onChange(newDateTime);
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
									{errors.start_time && !errors.end_time && (
										<p className="text-sm text-red-600 mt-1">
											{errors.start_time.message}
										</p>
									)}
								</div>
								{/* Start Time */}
								<div>
									<label className="block text-sm font-medium mb-1 text-foreground">
										Start Time *
									</label>
									<Controller
										name="start_time"
										control={control}
										render={({ field }) => (
											<input
												type="time"
												value={field.value ? format(field.value, "HH:mm") : ""}
												disabled={isAllDay}
												onChange={(e) => {
													const timeVal = e.target.value;
													if (!timeVal) return;
													const [hours, minutes] = timeVal
														.split(":")
														.map(Number);
													const currentDate = field.value || new Date();
													field.onChange(
														setHours(setMinutes(currentDate, minutes), hours)
													);
												}}
												className={cn(
													"w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground",
													isAllDay && "opacity-50 cursor-not-allowed"
												)}
											/>
										)}
									/>
								</div>
							</div>

							{/* End Date & Time Fields */}
							<div className="grid grid-cols-2 gap-3">
								{/* End Date */}
								<div>
									<label className="block text-sm font-medium mb-1 text-foreground">
										End Date *
									</label>
									<Controller
										name="end_time"
										control={control}
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													{/* Ensure this Button component handles asChild correctly */}
													<Button
														variant={"outline"}
														className={cn(
															"w-full justify-start text-left font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={(date) => {
															if (!date) return;
															const currentTime = field.value || new Date();
															const newDateTime = setHours(
																setMinutes(
																	startOfDay(date),
																	currentTime.getMinutes()
																),
																currentTime.getHours()
															);
															field.onChange(newDateTime);
														}}
														disabled={(date) => {
															const startDate = watch("start_time");
															return startDate
																? date < startOfDay(startDate)
																: false;
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
									{errors.end_time && (
										<p className="text-sm text-red-600 mt-1 col-span-2">
											{errors.end_time.message}
										</p>
									)}
								</div>
								{/* End Time */}
								<div>
									<label className="block text-sm font-medium mb-1 text-foreground">
										End Time *
									</label>
									<Controller
										name="end_time"
										control={control}
										render={({ field }) => (
											<input
												type="time"
												value={field.value ? format(field.value, "HH:mm") : ""}
												disabled={isAllDay}
												onChange={(e) => {
													const timeVal = e.target.value;
													if (!timeVal) return;
													const [hours, minutes] = timeVal
														.split(":")
														.map(Number);
													const currentDate = field.value || new Date();
													field.onChange(
														setHours(setMinutes(currentDate, minutes), hours)
													);
												}}
												className={cn(
													"w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground",
													isAllDay && "opacity-50 cursor-not-allowed"
												)}
											/>
										)}
									/>
								</div>
							</div>

							{/* All Day Checkbox */}
							<div className="flex items-center space-x-2 pt-2">
								<input
									id="is_all_day"
									type="checkbox"
									{...register("is_all_day")}
									className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
								/>
								<label
									htmlFor="is_all_day"
									className="text-sm font-medium text-foreground"
								>
									{" "}
									All Day Event{" "}
								</label>
							</div>

							{/* Modal Footer */}
							<div className="flex justify-between items-center pt-6 border-t border-border mt-6">
								{/* Delete Button */}
								<div>
									{" "}
									{isEditing && (
										<button
											type="button"
											onClick={() => setShowDeleteConfirm(true)}
											disabled={isSubmitting || isDeleting}
											className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{" "}
											<Trash2 className="mr-2 h-4 w-4" /> Delete{" "}
										</button>
									)}{" "}
								</div>
								{/* Cancel/Submit Buttons */}
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleClose}
										className="px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
									>
										{" "}
										Cancel{" "}
									</button>
									<button
										type="submit"
										disabled={isSubmitting || isDeleting}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSubmitting && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}{" "}
										{isEditing ? "Save Changes" : "Create Event"}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<>
					{" "}
					<div className="fixed inset-0 z-[60] bg-black/60"></div>{" "}
					<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
						{" "}
						<div className="relative w-full max-w-sm bg-card text-card-foreground rounded-lg shadow-xl border border-border p-6">
							{" "}
							<h3 className="text-lg font-semibold mb-2">Are you sure?</h3>{" "}
							<p className="text-sm text-muted-foreground mb-6">
								{" "}
								This action cannot be undone. This will permanently delete the
								event "{event?.resource?.title ?? "this event"}".{" "}
							</p>{" "}
							<div className="flex justify-end gap-2">
								{" "}
								<button
									type="button"
									onClick={() => setShowDeleteConfirm(false)}
									disabled={isDeleting}
									className="px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
								>
									{" "}
									Cancel{" "}
								</button>{" "}
								<button
									type="button"
									onClick={handleDelete}
									disabled={isDeleting}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
								>
									{" "}
									{isDeleting && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}{" "}
									Delete{" "}
								</button>{" "}
							</div>{" "}
						</div>{" "}
					</div>{" "}
				</>
			)}
		</>
	);
}
// Helper function (if not already available)
function addHours(date: Date, hours: number): Date {
	const newDate = new Date(date);
	newDate.setHours(newDate.getHours() + hours);
	return newDate;
}
