'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

let pythonProcess = null;
const PYTHON_DIST_FOLDER = 'backend_dist';
const PYTHON_FOLDER = 'backend';
const PYTHON_MODULE = 'api';

/*************************************************************
 * Python process
 *************************************************************/
function packaged() {
    return require('fs').existsSync(path.join(__static, PYTHON_DIST_FOLDER));
}

function getPythonScriptPath() {
    if (!packaged()) {
        return path.join(__static, PYTHON_FOLDER, `${PYTHON_MODULE}.py`);
    }

    if (process.platform === 'win32') {
        return path.join(__static, PYTHON_DIST_FOLDER, PYTHON_MODULE, `${PYTHON_MODULE}.exe`);
    }

    return path.join(__static, PYTHON_DIST_FOLDER, PYTHON_MODULE, PYTHON_MODULE);
}

function createPythonProcess() {
    const script = getPythonScriptPath();

    console.log('---------------------------creating python process---------------------------')

    console.log(script);

    console.log('packaged', packaged())

    if (packaged()) {
        pythonProcess = require('child_process').execFile(script);
    } else {
        pythonProcess = require('child_process').spawn('python', [script]);
    }

    console.log('---------------------------python process created---------------------------')

    pythonProcess.stdout.on('data', function(data) {
        console.log('received data!', data);
    })

    pythonProcess.stderr.on('data', function(data) {
        //Here is where the error output goes

        console.log('stderr: ' + data);

        data = data.toString();

        console.log(data);
    });
}

function exitPythonProcess() {
    pythonProcess.kill()
}

app.on('ready', createPythonProcess)
app.on('will-quit', exitPythonProcess)

/*************************************************************
 * window management
 *************************************************************/

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // enableRemoteModule: true,
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
            // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}