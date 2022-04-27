import {BrowserWindow, ipcMain} from 'electron'

declare const PROMPT_WINDOW_WEBPACK_ENTRY: string
declare const PROMPT_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const DEFAULT_WIDTH = 518;
const DEFAULT_HEIGHT = 227;

export const waitPromptInput = (promptText: string) => {

  return new Promise<string>((resolve, reject) => {
    let secondWindow: BrowserWindow | null;

    secondWindow = new BrowserWindow({
      // icon: path.join(assetsPath, 'assets', 'icon.png'),
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      resizable:true,
      fullscreenable: false,
      backgroundColor: '#191622',
      title:promptText,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: PROMPT_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    })

    secondWindow.loadURL(PROMPT_WINDOW_WEBPACK_ENTRY)

    secondWindow.on('closed', () => {
      secondWindow = null
      reject('Prompt closed' )
    })

    ipcMain.on('promptPostData',(_,data)=>{
      const payload = JSON.parse(data);
      secondWindow?.close()
      secondWindow = null
      resolve(payload.input as string);
    })

  });
}