import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    owner_id: string;
    team_id: string | null;
}

interface ProjectsOverviewProps {
    projects: Project[];
}

export function ProjectsOverview({ projects }: ProjectsOverviewProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Projects</h2>
                <Link href="/dashboard/projects">
                    <Button variant="ghost" size="sm">
                        View all
                    </Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="flex h-[150px] flex-col items-center justify-center space-y-3 py-8">
                        <h3 className="text-center font-medium">No projects yet</h3>
                        <p className="text-center text-sm text-muted-foreground">
                            Create a project to organize your tasks and collaborate with your team
                        </p>
                        <Link href="/dashboard/projects/create">
                            <Button>Create Project</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {projects.map((project) => (
                        <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                            <Card className="h-full cursor-pointer transition-all hover:shadow">
                                <CardHeader className="pb-3">
                                    <CardTitle className="line-clamp-1 text-base">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {project.description || "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-0">
                                    <div className="flex w-full justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(project.created_at)}</span>
                                        </div>
                                        {project.team_id && (
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>Team</span>
                                            </div>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}