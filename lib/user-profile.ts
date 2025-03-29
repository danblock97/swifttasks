// lib/user-profile.ts
import { headers } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// This is a cached function for server components
export const getUserProfile = cache(async () => {
    const headersList = await headers();
    const profileHeader = headersList.get('x-user-profile');

    // If we have the profile from middleware, use it
    if (profileHeader) {
        try {
            return JSON.parse(Buffer.from(profileHeader, 'base64').toString());
        } catch (error) {
            console.error('Error parsing profile from header:', error);
        }
    }

    // Fallback to querying if not available in headers
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*, teams(*)')
        .eq('id', session.user.id)
        .single();

    return profile;
});

// Helper function to get all user's projects in a single query
export const getUserProjects = cache(async (userId: string, teamId: string | null = null) => {
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

// Helper function to get all user's document spaces in a single query
export const getUserDocSpaces = cache(async (userId: string, teamId: string | null = null) => {
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