import {contextBridge, ipcRenderer} from 'electron'

interface Request {
  method: string,
  params?: any
}

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  sendMessage: (channel: string, message: string) => {
    ipcRenderer.send(channel, message)
  },

  sendAsyncRequest: (request: Request) => {
    ipcRenderer.send('asyncRequest', request)
  },

  sendSyncRequest: (request: Request) => {
    return ipcRenderer.sendSync('syncRequest', request);
  },

  sendPrompt: (promptText: string) => {
    return ipcRenderer.send('telegram-update', 'test');
  },

  promptPostData: (input: any) => {
    return ipcRenderer.send('promptPostData', input)
  },


  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },


  /**
   * Provide an easier way to listen to events
   */
  once: (channel: string, callback: Function) => {
    ipcRenderer.once(channel, (_, data) => callback(data))
  },

  off: (channel: string, callback: Function) => {
    ipcRenderer.off(channel, () => callback);
  }


}

contextBridge.exposeInMainWorld('Main', api)
