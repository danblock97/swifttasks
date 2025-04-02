export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface CalendarReminderPreferences {
	frequency: "none" | "on_day" | "1_day_before";
}

// Define the main Database interface
export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					created_at: string;
					display_name: string | null;
					avatar_url: string | null;
					account_type: "single" | "team_member" | null;
					team_id: string | null;
					is_team_owner: boolean | null;
					preferences: {
						darkMode?: boolean;
						notificationsEnabled?: boolean;
						defaultView?: "list" | "kanban" | "calendar";
						tasksSortOrder?: "due_date" | "priority" | "created_at";
						// Updated calendar reminders type
						calendar_reminders?: CalendarReminderPreferences;
					} | null; // jsonb
				};
				Insert: {
					id: string;
					email: string;
					created_at?: string;
					display_name?: string | null;
					avatar_url?: string | null;
					account_type?: "single" | "team_member" | null;
					team_id?: string | null;
					is_team_owner?: boolean | null;
					preferences?: Json | null; // Use Json for insert/update flexibility
				};
				Update: {
					id?: string;
					email?: string;
					created_at?: string;
					display_name?: string | null;
					avatar_url?: string | null;
					account_type?: "single" | "team_member" | null;
					team_id?: string | null;
					is_team_owner?: boolean | null;
					preferences?: Json | null; // Use Json for insert/update flexibility
				};
				Relationships: [
					{
						foreignKeyName: "users_id_fkey";
						columns: ["id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "users_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					}
				];
			};
			user_notifications: {
				Row: {
					id: string;
					user_id: string;
					type: string;
					title: string;
					content: string | null;
					data: Json | null;
					is_read: boolean | null;
					created_at: string | null;
					updated_at: string | null;
				};
				Insert: {
					id?: string;
					user_id: string;
					type: string;
					title: string;
					content?: string | null;
					data?: Json | null;
					is_read?: boolean | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Update: {
					id?: string;
					user_id?: string;
					type?: string;
					title?: string;
					content?: string | null;
					data?: Json | null;
					is_read?: boolean | null;
					created_at?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_notifications_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			todo_lists: {
				Row: {
					id: string;
					title: string;
					owner_id: string;
					created_at: string;
					team_id: string | null;
				};
				Insert: {
					id?: string;
					title: string;
					owner_id: string;
					created_at?: string;
					team_id?: string | null;
				};
				Update: {
					id?: string;
					title?: string;
					owner_id?: string;
					created_at?: string;
					team_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "todo_lists_owner_id_fkey";
						columns: ["owner_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "todo_lists_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					}
				];
			};
			todo_items: {
				Row: {
					id: string;
					content: string;
					is_completed: boolean | null;
					created_at: string;
					list_id: string;
					due_date: string | null;
					priority: "low" | "medium" | "high" | null;
				};
				Insert: {
					id?: string;
					content: string;
					is_completed?: boolean | null;
					created_at?: string;
					list_id: string;
					due_date?: string | null;
					priority?: "low" | "medium" | "high" | null;
				};
				Update: {
					id?: string;
					content?: string;
					is_completed?: boolean | null;
					created_at?: string;
					list_id?: string;
					due_date?: string | null;
					priority?: "low" | "medium" | "high" | null;
				};
				Relationships: [
					{
						foreignKeyName: "todo_items_list_id_fkey";
						columns: ["list_id"];
						isOneToOne: false;
						referencedRelation: "todo_lists";
						referencedColumns: ["id"];
					}
				];
			};
			teams: {
				Row: { id: string; name: string; created_at: string; owner_id: string };
				Insert: {
					id?: string;
					name: string;
					created_at?: string;
					owner_id: string;
				};
				Update: {
					id?: string;
					name?: string;
					created_at?: string;
					owner_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "teams_owner_id_fkey";
						columns: ["owner_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			team_invites: {
				Row: {
					id: string;
					email: string;
					team_id: string;
					created_at: string;
					expires_at: string;
					invite_code: string;
				};
				Insert: {
					id?: string;
					email: string;
					team_id: string;
					created_at?: string;
					expires_at: string;
					invite_code: string;
				};
				Update: {
					id?: string;
					email?: string;
					team_id?: string;
					created_at?: string;
					expires_at?: string;
					invite_code?: string;
				};
				Relationships: [
					{
						foreignKeyName: "team_invites_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					}
				];
			};
			projects: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					created_at: string;
					owner_id: string;
					team_id: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					created_at?: string;
					owner_id: string;
					team_id?: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					created_at?: string;
					owner_id?: string;
					team_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "projects_owner_id_fkey";
						columns: ["owner_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "projects_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					}
				];
			};
			doc_spaces: {
				Row: {
					id: string;
					name: string;
					created_at: string;
					owner_id: string;
					team_id: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					created_at?: string;
					owner_id: string;
					team_id?: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					created_at?: string;
					owner_id?: string;
					team_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "doc_spaces_owner_id_fkey";
						columns: ["owner_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "doc_spaces_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					}
				];
			};
			doc_pages: {
				Row: {
					id: string;
					title: string;
					content: string | null;
					created_at: string;
					updated_at: string;
					space_id: string;
					order: number;
				};
				Insert: {
					id?: string;
					title: string;
					content?: string | null;
					created_at?: string;
					updated_at?: string;
					space_id: string;
					order: number;
				};
				Update: {
					id?: string;
					title?: string;
					content?: string | null;
					created_at?: string;
					updated_at?: string;
					space_id?: string;
					order?: number;
				};
				Relationships: [
					{
						foreignKeyName: "doc_pages_space_id_fkey";
						columns: ["space_id"];
						isOneToOne: false;
						referencedRelation: "doc_spaces";
						referencedColumns: ["id"];
					}
				];
			};
			boards: {
				Row: {
					id: string;
					name: string;
					created_at: string;
					project_id: string;
				};
				Insert: {
					id?: string;
					name: string;
					created_at?: string;
					project_id: string;
				};
				Update: {
					id?: string;
					name?: string;
					created_at?: string;
					project_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "boards_project_id_fkey";
						columns: ["project_id"];
						isOneToOne: false;
						referencedRelation: "projects";
						referencedColumns: ["id"];
					}
				];
			};
			board_columns: {
				Row: {
					id: string;
					name: string;
					order: number;
					board_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					order: number;
					board_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					order?: number;
					board_id?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "board_columns_board_id_fkey";
						columns: ["board_id"];
						isOneToOne: false;
						referencedRelation: "boards";
						referencedColumns: ["id"];
					}
				];
			};
			board_items: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					order: number;
					column_id: string;
					created_at: string;
					assigned_to: string | null;
					priority: Database["public"]["Enums"]["priority_level"] | null;
					due_date: string | null;
					estimated_hours: number | null;
					labels: string[] | null;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					order: number;
					column_id: string;
					created_at?: string;
					assigned_to?: string | null;
					priority?: Database["public"]["Enums"]["priority_level"] | null;
					due_date?: string | null;
					estimated_hours?: number | null;
					labels?: string[] | null;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					order?: number;
					column_id?: string;
					created_at?: string;
					assigned_to?: string | null;
					priority?: Database["public"]["Enums"]["priority_level"] | null;
					due_date?: string | null;
					estimated_hours?: number | null;
					labels?: string[] | null;
				};
				Relationships: [
					{
						foreignKeyName: "board_items_assigned_to_fkey";
						columns: ["assigned_to"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "board_items_column_id_fkey";
						columns: ["column_id"];
						isOneToOne: false;
						referencedRelation: "board_columns";
						referencedColumns: ["id"];
					}
				];
			};

			// --- Calendar Table ---
			calendar_events: {
				Row: {
					id: string;
					user_id: string | null;
					team_id: string | null;
					created_by: string;
					title: string;
					description: string | null;
					start_time: string;
					end_time: string;
					is_all_day: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					team_id?: string | null;
					created_by: string;
					title: string;
					description?: string | null;
					start_time: string;
					end_time: string;
					is_all_day?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					team_id?: string | null;
					created_by?: string;
					title?: string;
					description?: string | null;
					start_time?: string;
					end_time?: string;
					is_all_day?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "calendar_events_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "calendar_events_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "calendar_events_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
		}; // End Tables
		Views: { [_ in never]: never };
		Functions: {
			is_team_member: {
				Args: { p_team_id: string; p_user_id: string };
				Returns: boolean;
			};
			is_team_owner: {
				Args: { p_team_id: string; p_user_id: string };
				Returns: boolean;
			};
		};
		Enums: { priority_level: "low" | "medium" | "high" };
		CompositeTypes: { [_ in never]: never };
	}; // End public schema
} // End Database interface

// --- Helper Types ---
export type Tables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
	Database["public"]["Enums"][T];

// --- Specific Db* Type Exports ---
export type DbUser = Tables<"users">;
export type DbTeam = Tables<"teams">;
export type DbProject = Tables<"projects">;
export type DbCalendarEvent = Tables<"calendar_events">;
export type DbUserNotification = Tables<"user_notifications">;
export type DbTodoList = Tables<"todo_lists">;
export type DbTodoItem = Tables<"todo_items">;
export type DbDocSpace = Tables<"doc_spaces">;
export type DbDocPage = Tables<"doc_pages">;
export type DbBoard = Tables<"boards">;
export type DbBoardColumn = Tables<"board_columns">;
export type DbBoardItem = Tables<"board_items">;
export type DbTeamInvite = Tables<"team_invites">;
