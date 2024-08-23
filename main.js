const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const remoteMain = require("@electron/remote/main");

remoteMain.initialize();

let win;
let updateWin;

async function createMainWindow() {
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

	win.loadURL(`file://${path.join(__dirname, "build", "index.html")}`);

	win.once("ready-to-show", () => {
		win.show();
	});
}

async function createUpdateWindow() {
	updateWin = new BrowserWindow({
		width: 400,
		height: 300,
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

function setupAutoUpdater() {
	autoUpdater.on("update-available", () => {
		if (win) {
			win.webContents.send("update_available"); // Notify the renderer process
		}
		createUpdateWindow(); // Show the update window when an update is available
	});

	autoUpdater.on("update-downloaded", () => {
		if (win) {
			win.webContents.send("update_downloaded"); // Notify the renderer process
		}
		// After the update is downloaded, quit and install the update
		autoUpdater.quitAndInstall();
	});

	autoUpdater.on("error", (err) => {
		console.error("Update error:", err);
		if (updateWin) {
			updateWin.close(); // Close the update window if there's an error
		}
	});

	autoUpdater.checkForUpdatesAndNotify(); // Check for updates immediately
}

app.on("ready", () => {
	createMainWindow().then(() => {
		setupAutoUpdater();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow().then(() => {
			setupAutoUpdater();
		});
	}
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
