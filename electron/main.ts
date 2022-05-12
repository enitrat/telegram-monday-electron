import {app, BrowserWindow, ipcMain} from 'electron'
import Controller from "./controllers/controller";
import {handleRequest} from "./requestHandler";

let mainWindow: BrowserWindow | null
let secondWindow: BrowserWindow | null


let controller:Controller;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()


function createWindow() {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    // icon:__dirname + './assets/Icon.icns'
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })


}

export const sendError = (message) =>{
    mainWindow?.webContents.send('error', message);
}


async function registerListeners() {
  /**
   * This comes from bridge integration, check bridge.ts
   */
  controller = new Controller(mainWindow?.webContents);
  const api = controller.getApi();
  ipcMain.on('syncRequest', (event, request) => {
    const payload = (request)
    const response = handleRequest(api, payload)
    //TODO DEBUG HERE
    event.returnValue = response
  })

  ipcMain.on('asyncRequest', (_, request) => {
    const payload = request
    const response = handleRequest(api, payload);
  })




}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  controller.stopTelegram();


  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
