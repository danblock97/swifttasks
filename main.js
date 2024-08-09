const { app, BrowserWindow } = require("electron");
const path = require("path");
const remoteMain = require("@electron/remote/main");

remoteMain.initialize();

async function createWindow() {
	const isDev = (await import("electron-is-dev")).default;

	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false, // Remove window border
		icon: path.join(__dirname, "assets", "icon.png"), // Path to your icon file
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true, // Important for enabling remote access
		},
	});

	remoteMain.enable(win.webContents); // Enable remote module for this window

	win.setMenu(null); // Remove the default menu

	win.loadURL(
		isDev
			? "http://localhost:3000"
			: `file://${path.join(__dirname, "build/index.html")}`
	);

	if (isDev) {
		win.webContents.openDevTools();
	}
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
