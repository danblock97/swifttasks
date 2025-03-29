// lib/user-profile.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { fetchUserProfile, fetchServerSession } from './supabase/utils';

// This is a simplified version that uses our enhanced cache
export const getUserProfile = fetchUserProfile;

// Helper function to get all user's projects in a single query - with improved caching
export const getUserProjects = cache(async (userId: string, teamId: string | null = null) => {
    // Get session using our cached method
    const session = await fetchServerSession();
    if (!session.data.session) return [];

    const supabase = createServerComponentClient({ cookies });

    let query = supabase
        .from('projects')
        .select('*');

    if (teamId) {
        // User is part of a team, get both personal and team projects
        query = query.or(`owner_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
        // User is not part of a team, only get personal projects
        query = query.eq('owner_id', userId);
    }

    const { data: projects } = await query.order('created_at', { ascending: false });
    return projects || [];
});

// Helper function for document spaces - with improved caching
export const getUserDocSpaces = cache(async (userId: string, teamId: string | null = null) => {
    // Get session using our cached method
    const session = await fetchServerSession();
    if (!session.data.session) return [];

    const supabase = createServerComponentClient({ cookies });

    let query = supabase
        .from('doc_spaces')
        .select('*');

    if (teamId) {
        // User is part of a team, get both personal and team document spaces
        query = query.or(`owner_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
        // User is not part of a team, only get personal document spaces
        query = query.eq('owner_id', userId);
    }

    const { data: spaces } = await query.order('created_at', { ascending: false });
    return spaces || [];
});