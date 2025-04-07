"use client";

import dynamic from "next/dynamic";

// Import FeedbackButtons with dynamic import on the client side
const FeedbackButtons = dynamic(
	() => import("./feedback-buttons").then((mod) => mod.FeedbackButtons),
	{ ssr: false }
);

export function FeedbackButtonsWrapper() {
	return <FeedbackButtons />;
}
