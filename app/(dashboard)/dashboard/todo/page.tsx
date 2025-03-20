import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TodoList } from "@/components/todo/todo-list";
import { NewTodoForm } from "@/components/todo/new-todo-form";

export default async function TodoPage() {
    const supabase = createServerComponentClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

    const { data: todoList } = await supabase
        .from("todo_lists")
        .select("*")
        .eq("owner_id", session.user.id)
        .single();
    let todoListId = todoList?.id;

    if (!todoList) {
        const { data: newTodoList, error } = await supabase
            .from("todo_lists")
            .insert({
                title: "My Todo List",
                owner_id: session.user.id,
                team_id: profile?.team_id
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to create todo list:", error);
            // Handle error appropriately
        } else {
            todoListId = newTodoList.id;
        }
    }

    const { data: todoItems } = await supabase
        .from("todo_items")
        .select("*")
        .eq("list_id", todoListId)
        .order("created_at", { ascending: false });

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Todo List"
                description="Manage your personal tasks and todos."
            />

            <div className="grid gap-6">
                <NewTodoForm todoListId={todoListId} />
                <TodoList todoItems={todoItems || []} />
            </div>
        </DashboardShell>
    );
}