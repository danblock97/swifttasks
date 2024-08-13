const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const remoteMain = require("@electron/remote/main");

remoteMain.initialize();

let win;

async function createWindow() {
	const isDev = (await import("electron-is-dev")).default;

	// Create the browser window.
	win = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false, // Remove window border
		icon: path.join(__dirname, "assets", "logo.ico"), // Path to your icon file
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true, // Important for enabling remote access
		},
		show: false, // Initially hide the window
	});

	remoteMain.enable(win.webContents); // Enable remote module for this window

	// Load the splash screen
	win.loadURL(`file://${path.join(__dirname, "assets", "splash.html")}`);

	// Once ready, show the main window
	win.once("ready-to-show", () => {
		win.show();

		// Load the main application window
		win.loadURL(
			isDev
				? "http://localhost:3000"
				: `file://${path.join(__dirname, "build", "index.html")}`
		);

		if (isDev) {
			win.webContents.openDevTools();
		}
	});

	// AutoUpdater setup
	autoUpdater.checkForUpdatesAndNotify();

	autoUpdater.on("update-available", () => {
		win.webContents.send("update_available");
	});

	autoUpdater.on("update-downloaded", () => {
		win.webContents.send("update_downloaded");
	});
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

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
