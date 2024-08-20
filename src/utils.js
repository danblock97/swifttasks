export const statusMapping = {
	todo: "To Do",
	"in-progress": "In Progress",
	done: "Done",
};

export const statusMappingReverse = {
	"To Do": "todo",
	"In Progress": "in-progress",
	Done: "done",
};

export const formatStatus = (status) => {
	switch (status) {
		case "to_do":
			return "To Do";
		case "in_progress":
			return "In Progress";
		case "done":
			return "Done";
		default:
			return status;
	}
};
