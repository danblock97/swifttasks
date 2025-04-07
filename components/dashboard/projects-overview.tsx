"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import {
	Clock,
	Users,
	ChevronDown,
	ChevronRight,
	Kanban,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
	owner_id: string;
	team_id: string | null;
}

interface BoardItem {
	id: string;
	title: string;
	description: string | null;
	column_id: string;
	priority: "low" | "medium" | "high" | null;
	due_date: string | null;
	board_id: string;
	column_name: string;
	board_name: string;
}

interface ProjectWithTasks extends Project {
	tasks: BoardItem[];
	isExpanded: boolean;
}

interface ProjectsOverviewProps {
	projects: Project[];
}

export function ProjectsOverview({
	projects: initialProjects,
}: ProjectsOverviewProps) {
	const [projectsWithTasks, setProjectsWithTasks] = useState<
		ProjectWithTasks[]
	>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const supabase = createClientComponentClient();

	// Fetch tasks for all projects
	useEffect(() => {
		const fetchProjectTasks = async () => {
			setLoading(true);
			try {
				// Map projects to include tasks and expanded state
				const projectsData = await Promise.all(
					initialProjects.map(async (project) => {
						// Get all boards for this project
						const { data: boards } = await supabase
							.from("boards")
							.select("id, name")
							.eq("project_id", project.id);

						if (!boards || boards.length === 0) {
							return { ...project, tasks: [], isExpanded: true };
						}

						// Get board columns and items
						const boardIds = boards.map((board) => board.id);

						// First get columns
						const { data: columns } = await supabase
							.from("board_columns")
							.select("id, name, board_id")
							.in("board_id", boardIds);

						if (!columns || columns.length === 0) {
							return { ...project, tasks: [], isExpanded: true };
						}

						// Then get items for those columns
						const columnIds = columns.map((col) => col.id);
						const { data: items } = await supabase
							.from("board_items")
							.select("*")
							.in("column_id", columnIds)
							.order("due_date", { ascending: true })
							.limit(5);

						// Map board and column names to items
						const tasksWithDetails = (items || []).map((item) => {
							const column = columns.find((col) => col.id === item.column_id);
							const board = boards.find(
								(board) => board.id === column?.board_id
							);
							return {
								...item,
								column_name: column?.name || "Unknown",
								board_name: board?.name || "Unknown",
								board_id: column?.board_id || "",
							};
						});

						return {
							...project,
							tasks: tasksWithDetails,
							isExpanded: true,
						};
					})
				);

				setProjectsWithTasks(projectsData);
			} catch (error) {
				console.error("Error fetching project tasks:", error);
			} finally {
				setLoading(false);
			}
		};

		if (initialProjects.length > 0) {
			fetchProjectTasks();
		} else {
			setProjectsWithTasks([]);
			setLoading(false);
		}
	}, [initialProjects, supabase]);

	// Toggle project expansion
	const toggleProjectExpansion = (projectId: string) => {
		setProjectsWithTasks((prev) =>
			prev.map((project) =>
				project.id === projectId
					? { ...project, isExpanded: !project.isExpanded }
					: project
			)
		);
	};

	// Get priority icon and color
	const getPriorityDetails = (priority: string | null) => {
		switch (priority) {
			case "high":
				return {
					icon: <AlertCircle className="h-4 w-4" />,
					color: "text-red-500",
					label: "High",
				};
			case "medium":
				return {
					icon: <Clock className="h-4 w-4" />,
					color: "text-yellow-500",
					label: "Medium",
				};
			case "low":
				return {
					icon: <CheckCircle2 className="h-4 w-4" />,
					color: "text-green-500",
					label: "Low",
				};
			default:
				return {
					icon: null,
					color: "",
					label: "None",
				};
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold">Project Tasks</h2>
				<Link href="/dashboard/projects">
					<Button variant="ghost" size="sm">
						View all projects
					</Button>
				</Link>
			</div>

			{initialProjects.length === 0 ? (
				<Card>
					<CardContent className="flex h-[150px] flex-col items-center justify-center space-y-3 py-8">
						<h3 className="text-center font-medium">No projects yet</h3>
						<p className="text-center text-sm text-muted-foreground">
							Create a project to organize your tasks and collaborate with your
							team
						</p>
						<Link href="/dashboard/projects/create">
							<Button>Create Project</Button>
						</Link>
					</CardContent>
				</Card>
			) : loading ? (
				<Card>
					<CardContent className="flex h-[150px] items-center justify-center">
						<div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{projectsWithTasks.map((project) => (
						<Card key={project.id} className="overflow-hidden">
							<div
								className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50"
								onClick={() => toggleProjectExpansion(project.id)}
							>
								<div className="flex items-center gap-2">
									{project.isExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
									<h3 className="font-medium">{project.name}</h3>
									{project.team_id && (
										<Badge variant="outline" className="ml-2 h-5 text-xs">
											<Users className="h-3 w-3 mr-1" />
											Team
										</Badge>
									)}
								</div>
								<div className="text-xs text-muted-foreground">
									{project.tasks.length} tasks
								</div>
							</div>

							{project.isExpanded && (
								<CardContent className="pb-6 pt-0">
									{project.tasks.length === 0 ? (
										<div className="flex h-[80px] items-center justify-center rounded-md border border-dashed">
											<div className="text-center">
												<p className="text-sm text-muted-foreground">
													No tasks in this project yet.
												</p>
												<Link
													href={`/dashboard/projects/${project.id}`}
													className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
												>
													Create your first task
												</Link>
											</div>
										</div>
									) : (
										<div className="space-y-3">
											{project.tasks.map((task) => {
												const priorityDetails = getPriorityDetails(
													task.priority
												);

												return (
													<Link
														key={task.id}
														href={`/dashboard/projects/${project.id}/boards/${task.board_id}`}
														className="block hover:bg-accent/50 rounded-md transition-colors"
													>
														<div className="flex items-start justify-between space-x-4 border p-4 rounded-md">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	<span className="text-sm font-medium truncate">
																		{task.title}
																	</span>
																</div>
																<div className="flex items-center gap-2 text-xs text-muted-foreground">
																	<Badge
																		variant="secondary"
																		className="rounded-sm px-1 py-0 text-xs"
																	>
																		{task.column_name}
																	</Badge>
																	<span>•</span>
																	<span className="flex items-center gap-1">
																		<Kanban className="h-3 w-3" />
																		{task.board_name}
																	</span>
																	{task.due_date && (
																		<>
																			<span>•</span>
																			<span className="flex items-center gap-1">
																				<Clock className="h-3 w-3" />
																				Due {formatDate(task.due_date)}
																			</span>
																		</>
																	)}
																</div>
															</div>
															{task.priority && (
																<Badge
																	variant="outline"
																	className={cn(
																		"flex items-center gap-1 shrink-0",
																		priorityDetails.color
																	)}
																>
																	{priorityDetails.icon}
																	<span className="hidden sm:inline">
																		{priorityDetails.label}
																	</span>
																</Badge>
															)}
														</div>
													</Link>
												);
											})}

											<div className="mt-2 text-center">
												<Link
													href={`/dashboard/projects/${project.id}`}
													className="text-sm font-medium text-primary hover:underline"
												>
													View all tasks
												</Link>
											</div>
										</div>
									)}
								</CardContent>
							)}
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
