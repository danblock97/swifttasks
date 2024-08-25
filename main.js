const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const remoteMain = require("@electron/remote/main");

remoteMain.initialize();

let win;
let updateWin;

// Function to dynamically import and initialize electron-store
async function initStore() {
	const Store = (await import("electron-store")).default;
	return new Store();
}

// Function to dynamically import electron-is-dev
async function isDev() {
	const electronIsDev = (await import("electron-is-dev")).default;
	return electronIsDev;
}

async function createMainWindow() {
	const store = await initStore();

	// Get the saved window state or default to initial values
	const savedWindowState = store.get("windowState", {
		width: 1280,
		height: 720,
		x: undefined,
		y: undefined,
		isMaximized: false,
		isFullScreen: false,
	});

	win = new BrowserWindow({
		width: savedWindowState.width,
		height: savedWindowState.height,
		x: savedWindowState.x,
		y: savedWindowState.y,
		frame: false,
		icon: path.join(__dirname, "assets", "logo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
		show: false, // Initially hide the window
	});

	if (savedWindowState.isMaximized) {
		win.maximize();
	}

	if (savedWindowState.isFullScreen) {
		win.setFullScreen(true);
	}

	remoteMain.enable(win.webContents);

	const devMode = await isDev();

	if (devMode) {
		win.loadURL("http://localhost:3000"); // Load from localhost in development
		win.webContents.openDevTools(); // Open DevTools automatically in development
	} else {
		win.loadURL(`file://${path.join(__dirname, "build", "index.html")}`); // Load the built React app in production
	}

	win.once("ready-to-show", () => {
		win.show();
	});

	// Store window size, position, and state when it's about to be closed
	win.on("close", () => {
		const windowState = {
			width: win.getBounds().width,
			height: win.getBounds().height,
			x: win.getBounds().x,
			y: win.getBounds().y,
			isMaximized: win.isMaximized(),
			isFullScreen: win.isFullScreen(),
		};
		store.set("windowState", windowState);
	});
}

async function createUpdateWindow() {
	if (updateWin) {
		return; // Prevent creating multiple update windows
	}

	updateWin = new BrowserWindow({
		width: 400,
		height: 500,
		frame: false,
		alwaysOnTop: true,
		resizable: false,
		icon: path.join(__dirname, "assets", "logo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	updateWin.loadURL(`file://${path.join(__dirname, "assets", "update.html")}`);

	updateWin.on("closed", () => {
		updateWin = null;
	});

	updateWin.show(); // Show the update window immediately
}

function setupAutoUpdater(store) {
	// Normal update checking process
	autoUpdater.on("checking-for-update", () => {
		if (updateWin) {
			updateWin.webContents.send("update-status", "Checking for updates");
		}
		console.log("Checking for updates...");
	});

	autoUpdater.on("update-available", () => {
		if (updateWin) {
			updateWin.webContents.send("update-status", "Update found, restarting");
		}
		console.log("Update available, downloading...");
		if (win) {
			win.hide(); // Hide the main window if an update is available
		}
		createUpdateWindow(); // Only create the update window if not already created
	});

	autoUpdater.on("update-not-available", () => {
		console.log("No update available, showing main window.");
		if (updateWin) {
			updateWin.close(); // Close the update window if no update is available
		}
		createMainWindow(); // Open the main window
	});

	autoUpdater.on("update-downloaded", () => {
		if (updateWin) {
			updateWin.webContents.send("update-status", "Update found, restarting");
		}
		console.log("Update downloaded, installing...");
		autoUpdater.quitAndInstall();
	});

	autoUpdater.on("error", (err) => {
		console.error("Update error:", err);
		if (updateWin) {
			updateWin.close(); // Close the update window if there's an error
		}
		createMainWindow(); // Open the main window even if there's an error
	});

	autoUpdater.checkForUpdatesAndNotify(); // Check for updates immediately
}

app.on("ready", async () => {
	const store = await initStore();

	const devMode = await isDev();

	if (devMode) {
		createMainWindow(); // Skip the updater and just show the main window in development
	} else {
		setupAutoUpdater(store); // Start checking for updates in production
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", async () => {
	const store = await initStore();
	if (BrowserWindow.getAllWindows().length === 0) {
		createUpdateWindow(); // Show the update window if reactivated
		setupAutoUpdater(store); // Ensure the updater is set up
	}
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
