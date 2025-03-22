export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                    display_name: string | null
                    avatar_url: string | null
                    account_type: 'single' | 'team_member'
                    team_id: string | null
                    is_team_owner: boolean
                }
                Insert: {
                    id: string
                    email: string
                    created_at?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    account_type?: 'single' | 'team_member'
                    team_id?: string | null
                    is_team_owner?: boolean
                }
                Update: {
                    id?: string
                    email?: string
                    created_at?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    account_type?: 'single' | 'team_member'
                    team_id?: string | null
                    is_team_owner?: boolean
                }
            }
            teams: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    owner_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    owner_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    owner_id?: string
                }
            }
            todo_lists: {
                Row: {
                    id: string
                    title: string
                    owner_id: string
                    created_at: string
                    team_id: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    owner_id: string
                    created_at?: string
                    team_id?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    owner_id?: string
                    created_at?: string
                    team_id?: string | null
                }
            }
            todo_items: {
                Row: {
                    id: string
                    content: string
                    is_completed: boolean
                    created_at: string
                    list_id: string
                    due_date: string | null
                    priority: 'low' | 'medium' | 'high' | null
                }
                Insert: {
                    id?: string
                    content: string
                    is_completed?: boolean
                    created_at?: string
                    list_id: string
                    due_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | null
                }
                Update: {
                    id?: string
                    content?: string
                    is_completed?: boolean
                    created_at?: string
                    list_id?: string
                    due_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | null
                }
            }
            projects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    owner_id: string
                    team_id: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    owner_id: string
                    team_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    owner_id?: string
                    team_id?: string | null
                }
            }
            boards: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    project_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    project_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    project_id?: string
                }
            }
            board_columns: {
                Row: {
                    id: string
                    name: string
                    order: number
                    board_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    order: number
                    board_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    order?: number
                    board_id?: string
                    created_at?: string
                }
            }
            board_items: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    order: number
                    column_id: string
                    created_at: string
                    assigned_to: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    order: number
                    column_id: string
                    created_at?: string
                    assigned_to?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    order?: number
                    column_id?: string
                    created_at?: string
                    assigned_to?: string | null
                }
            }
            doc_spaces: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    owner_id: string
                    team_id: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    owner_id: string
                    team_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    owner_id?: string
                    team_id?: string | null
                }
            }
            doc_pages: {
                Row: {
                    id: string
                    title: string
                    content: string | null
                    created_at: string
                    updated_at: string
                    space_id: string
                    order: number
                }
                Insert: {
                    id?: string
                    title: string
                    content?: string | null
                    created_at?: string
                    updated_at?: string
                    space_id: string
                    order: number
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string | null
                    created_at?: string
                    updated_at?: string
                    space_id?: string
                    order?: number
                }
            }
            team_invites: {
                Row: {
                    id: string
                    email: string
                    team_id: string
                    created_at: string
                    expires_at: string
                    invite_code: string
                }
                Insert: {
                    id?: string
                    email: string
                    team_id: string
                    created_at?: string
                    expires_at: string
                    invite_code: string
                }
                Update: {
                    id?: string
                    email?: string
                    team_id?: string
                    created_at?: string
                    expires_at?: string
                    invite_code?: string
                }
            }
            user_notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    content: string | null
                    data: Json | null
                    is_read: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    content?: string | null
                    data?: Json | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    content?: string | null
                    data?: Json | null
                    is_read?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}