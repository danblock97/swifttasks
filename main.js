const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const remoteMain = require("@electron/remote/main");

remoteMain.initialize();

let win;
let updateWin;

async function createWindow() {
	const isDev = (await import("electron-is-dev")).default;

	// Create the main application window but don't show it yet
	await createMainWindow(isDev);

	if (isDev) {
		// Simulate update in development mode
		simulateUpdateProcess();
	} else {
		// AutoUpdater setup
		autoUpdater.checkForUpdatesAndNotify();
	}

	autoUpdater.on("update-available", () => {
		createUpdateWindow();
		if (win) {
			win.hide(); // Hide the main window if it's already open
		}
	});

	autoUpdater.on("update-downloaded", () => {
		if (updateWin) {
			updateWin.close(); // Close the update window when update is downloaded
		}
		showMainWindow(); // Show the main window after the update
	});

	autoUpdater.on("error", (err) => {
		console.error("Update error:", err);
		if (updateWin) {
			updateWin.close(); // Close the update window if there's an error
		}
		showMainWindow(); // Show the main window if there's an error
	});
}

async function createMainWindow(isDev) {
	win = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		icon: path.join(__dirname, "assets", "logo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
		show: false, // Initially hide the window
	});

	remoteMain.enable(win.webContents);

	win.loadURL(
		isDev
			? "http://localhost:3000"
			: `file://${path.join(__dirname, "build", "index.html")}`
	);

	win.once("ready-to-show", () => {
		console.log("Main window ready to show");
		// The main window will only be shown after the update process is complete
	});

	if (isDev) {
		win.webContents.openDevTools();
	}
}

function showMainWindow() {
	if (win) {
		console.log("Showing main window");
		win.show(); // Show the main window after the update
	}
}

function createUpdateWindow() {
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

function simulateUpdateProcess() {
	// Show the update window first
	createUpdateWindow();

	// Simulate the download process after a few seconds
	setTimeout(() => {
		console.log("Simulating update download...");
		autoUpdater.emit("update-downloaded");
	}, 5000); // Simulate download time
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
