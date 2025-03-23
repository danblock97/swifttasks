// Create a new server component wrapper as the main page.tsx

import { Suspense } from "react";
import ConfirmTeamJoinClient from "./client";

export default function ConfirmTeamJoinPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="max-w-md w-full p-8 flex flex-col items-center justify-center space-y-4 border rounded-lg shadow-sm">
                    <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <h1 className="text-xl font-semibold mt-4">Loading...</h1>
                    <p className="text-center text-muted-foreground">
                        Please wait while we load the invitation details.
                    </p>
                </div>
            </div>
        }>
            <ConfirmTeamJoinClient />
        </Suspense>
    );
}