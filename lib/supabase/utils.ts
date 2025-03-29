// lib/supabase/utils.ts
// This file provides utilities that abstract away whether we're in a client or server context

import { Database } from './database.types';

// This is a helper function to abstract away the implementation details
// of fetching user profile - used in server components
export async function fetchUserProfile() {
    // We need to dynamically import the server-client to avoid issues with
    // client components trying to import server-only modules
    const { getServerProfile } = await import('./server-client');
    return getServerProfile();
}

// This is a helper function to get the server session - used in server components
export async function fetchServerSession() {
    const { getServerSession } = await import('./server-client');
    return getServerSession();
}

// Service client abstraction for API routes
export async function getServiceClient() {
    const { getServiceRoleClient } = await import('./server-client');
    return getServiceRoleClient();
}