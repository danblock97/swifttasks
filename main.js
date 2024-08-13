const { app, BrowserWindow } = require("electron");
const path = require("path");
const remoteMain = require("@electron/remote/main");
const { autoUpdater } = require("electron-updater"); // Electron-updater for more control
require("update-electron-app")();

let mainWindow;
let splashWindow;

remoteMain.initialize();

function createSplashWindow() {
	splashWindow = new BrowserWindow({
		width: 400,
		height: 300,
		frame: false, // No window frame
		transparent: true, // Make window background transparent
		alwaysOnTop: true,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	splashWindow.loadURL(
		`file://${path.join(__dirname, "public", "splash.html")}`
	);
}

async function createMainWindow() {
	const isDev = (await import("electron-is-dev")).default;

	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		icon: path.join(__dirname, "assets", "logo.ico"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});

	remoteMain.enable(mainWindow.webContents);

	mainWindow.setMenu(null);

	mainWindow.loadURL(
		isDev
			? "http://localhost:3000"
			: `file://${path.join(__dirname, "build", "index.html")}`
	);

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}
}

app.on("ready", () => {
	createSplashWindow();

	autoUpdater.checkForUpdatesAndNotify();

	autoUpdater.on("checking-for-update", () => {
		// Optionally update splash screen content
	});

	autoUpdater.on("update-available", () => {
		// Optionally show "Update available" on splash screen
	});

	autoUpdater.on("update-not-available", () => {
		splashWindow.close();
		createMainWindow();
	});

	autoUpdater.on("update-downloaded", () => {
		// Send a message to the splash screen to update the displayed message
		splashWindow.webContents.send("update-ready");

		// Optionally, you can wait a few seconds before restarting
		setTimeout(() => {
			autoUpdater.quitAndInstall(); // Quit and install the update
		}, 3000); // Wait 3 seconds before restarting
	});

	autoUpdater.on("error", (err) => {
		console.error("There was a problem updating the application: ", err);
		splashWindow.close();
		createMainWindow(); // If an error occurs, open the main window anyway
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});
