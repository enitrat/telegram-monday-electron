import Store from "electron-store";
import ElectronStore from "electron-store";
import {TelegramController} from "./telegram.controller";
import {MondayController} from "./monday.controller";
import {RateLimiter} from "limiter";
import {customLog, filterKeywordGroup, filterParticipantsGroup, getTargetItemGroup} from "../utils/helpers";
import {sendError} from "../main";

const limiter = new RateLimiter({tokensPerInterval: 22, interval: "minute"});

const formatStore = (store) => {
  if (Object.keys(store).length === 0)
    return undefined;
  return store;
}

export default class Controller {
  public windowChannel: Electron.WebContents
  private readonly _mondayStore: ElectronStore;
  private readonly _keyStore: ElectronStore;
  private readonly _optionalStore: ElectronStore;
  private scanInterval;
  public telegramController: TelegramController | undefined;
  public mondayController: MondayController | undefined;


  constructor(windowChannel: Electron.WebContents) {
    this.windowChannel = windowChannel;
    this._keyStore = new Store({name: 'keyConfig'});
    this._mondayStore = new Store({name: 'mondayConfig'})
    this._optionalStore = new Store({name: 'optionalConfig'})


  }

  getKeyConfig(): any {
    return formatStore(this._keyStore.store);
    // return this._keyStore.get('config');
  }

  getMondayConfig(): any {
    return formatStore(this._mondayStore.store);
    // return this._mondayStore.get('config');
  }

  getOptionalConfig(): any {
    // console.log(this._optionalStore.store);
    return formatStore(this._optionalStore.store)
    // return this._optionalStore.get('config');
  }

  getFullConfig(): any {
    return {
      ...this.getMondayConfig(),
      ...this.getOptionalConfig(),
    }
  }

  async getAllBoards() {
    if (!this.mondayController) this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig());
    const boards = await this.mondayController.getAllBoards()
    this.windowChannel.send('all_boards', boards);
  }

  async getMondayBoard() {
    const targetBoard = this.mondayController.getBoard(this.mondayController.config.board_id)
    this.windowChannel.send('target_board', targetBoard);
  }

  setKeyConfig(config: any) {
    if (!config) {
      this.mondayController = undefined;
      this._keyStore.clear()
    } else {
      this._keyStore.set(config)
    }
    //TODO check this
    this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig())
  }

  setMondayConfig(config: any) {
    if (!config) {
      this._mondayStore.clear()
    } else {
      this._mondayStore.set(config);
    }
    this.mondayController.config = this.getFullConfig();
  }

  setOptionalConfig(config: any) {
    if (!config) {
      this._optionalStore.clear()
    } else {
      this._optionalStore.set(config);
    }
    this.mondayController.config = this.getFullConfig();
  }


  getApi() {
    const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    const api = properties.reduce((endpoints: any, property) => {
      if (property === "constructor") {
        return endpoints;
      }
      endpoints[property] = (this as any)[property].bind(this)
      return endpoints;
    }, {});
    return api;
  }

  sendWindowMessage(message) {
    this.windowChannel.send('scan_update', message);
  }

  async createNewBoard() {
    if (!this.mondayController) this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig())
    try {
      await this.mondayController.createPreconfigBoard({});
      this.setMondayConfig(this.mondayController.config)
      this.windowChannel.send('create_board', {
        result: "success",
        data: this.getMondayConfig()
      })

    } catch (e) {
      customLog(e)
      sendError("Couldn't create board : " + e.message);
    }
  }

  async getCurrentBoard(id) {
    if (!this.mondayController) this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig())
    const currentBoard = await this.mondayController.getBoard(id);
    this.windowChannel.send('currentBoard', currentBoard);
  }

  async stopTelegram() {
    clearInterval(this.scanInterval)
    await this.telegramController.stopClient();
    this.sendWindowMessage(
      {
        type: "info",
        text: "Telegram client stopped"
      })
  }

  async startBoardFill(fillBoardId) {
    try {
      this.telegramController = new TelegramController(this.getKeyConfig())
      if (!this.mondayController) this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig())
      await this.telegramController.startClient()
      const newConfig = await this.telegramController.connectTelegram(this.getKeyConfig());
      if (newConfig) this.setKeyConfig(newConfig);

      await this.startScanning(fillBoardId)
    } catch (e) {
      customLog(e)
      this.sendWindowMessage({
        type: "error",
        text: e.message
      });
    }

  }

  /**
   * Updates all of the boards passed as parameter.
   * @param board_ids array of board ids to update.
   */
  async startBoardUpdates() {
    try {
      const board_ids = this.getOptionalConfig().updated_boards.map((board) => board.id);
      this.telegramController = new TelegramController(this.getKeyConfig())
      if (!this.mondayController) this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getFullConfig())
      if (!this.telegramController.telegramClient?.connected) await this.telegramController.startClient()
      const newConfig = await this.telegramController.connectTelegram(this.getKeyConfig());
      if (newConfig) this.setKeyConfig(newConfig);

      for (const id of board_ids) {
        console.log(id)
        await this.updateBoard(id)
      }

      this.sendWindowMessage({
        type: "update",
        text: "success"
      });
    } catch (e) {
      customLog(e)
      this.sendWindowMessage({
        type: "error",
        text: e.message
      });
    }

  }

  async startScanning(fillBoardId) {
    // await this.updateBoard()
    await this.fillBoard(fillBoardId);

    //This gets terminated if we don't catch the error before.
    clearInterval(this.scanInterval)
    this.scanInterval = setInterval(async () => {
      console.log('should scan')
      await this.fillBoard(fillBoardId);
    }, 60 * 1000)

  }

  /**
   * Updates the Last Message Date column of a board element if there is a new message.
   * @param id?:string optional target board id.
   * @returns {Promise<void>}
   */
  async updateBoard(id: string): Promise<void> {
    this.sendWindowMessage({
      type: "info",
      text: "Updating board..." + id || ""
    });

    //get group accounts, private chats, and already exported chats. if no id specified => using config id.
    let {accountGroups, privateChats, exportedChats, targetBoard} = await this.scanGroups(id);
    for (const group of [...accountGroups, ...privateChats]) {
      // if (filterKeywordGroup(this.mondayController!.config[id], group)) continue;
      let exportedItem = exportedChats.find((exportedChat: any) => exportedChat.name.toLowerCase() === group.title.toLowerCase());
      if (!exportedItem) continue;
      let lastMsgDate = group.lastMsgDate! * 1000
      const exportedDate = JSON.parse(exportedItem.lastMsg)
      let parsedExportedDate = new Date(exportedDate.date + 'T' + exportedDate.time).getTime()
      if (parsedExportedDate === lastMsgDate) {
        continue;
      }
      await limiter.removeTokens(1);
      await this.updateItem(targetBoard, group, exportedItem)
    }

  }


  async scanGroups(id: string) {
    await limiter.removeTokens(1);
    const targetBoard = await this.mondayController!.getBoard(id);
    if (!targetBoard) throw new Error(`Couldn't get Monday board with id ${id}`)
    let exportedChats = await this.mondayController!.getExportedChats(targetBoard);
    if (!exportedChats) throw Error("couldn't get board chats");
    const {fmtGroups: accountGroups, fmtPrivate: privateChats} = await this.telegramController!.getDialogs();
    return {
      accountGroups: accountGroups,
      privateChats: privateChats,
      exportedChats: exportedChats,
      targetBoard: targetBoard
    }
  }


  /**
   * Updates an item already inside the board
   * @param targetBoard Board to update
   * @param group group corresponding to the item
   * @param item item to update
   * @returns {Promise<void>}
   */
  async updateItem(targetBoard: any, group: any, item: any) {
    let lastMsgDate = new Date(group.lastMsgDate * 1000)
    const elementsIds = this.mondayController!.getElementsIds(targetBoard)
    let chatName = group.title.toString();
    let chatLink = group.link;
    const dateObject = {
      date: lastMsgDate.toISOString().split('T')[0],
      time: lastMsgDate.toLocaleTimeString('en-GB'),
    }

    let query = `mutation($board: Int!, $itemId: Int!, $columnVals: JSON!) {change_multiple_column_values ( board_id:$board, item_id:$itemId, column_values:$columnVals) {name} }`

    let vars = {
      "board": elementsIds.boardId,
      "itemId": parseInt(item.id),
      "columnVals": JSON.stringify({
        [elementsIds.lastMessageDate]: dateObject
      })
    }
    await this.mondayController!.updateItem(query, vars)
    // console.log(`chat ${chatName} was updated ! | ${chatLink}`);
    this.sendWindowMessage({
      type: "info",
      text: `chat ${chatName} was updated ! | ${chatLink}`
    });


  }

  async fillBoard(fillBoardId) {
    try {
      this.sendWindowMessage({
        type: "info",
        text: "Searching for new chats..."
      });
      //TODO here targetBoard must not come from here
      let {accountGroups, privateChats, exportedChats, targetBoard} = await this.scanGroups(fillBoardId);
      for (const group of [...accountGroups, ...privateChats]) {
        if (filterKeywordGroup(this.mondayController!.config[fillBoardId], group)) continue;
        let foundGroup = exportedChats.find((exportedChat: any) => exportedChat.name.toLowerCase() === group.title.toLowerCase());
        if (foundGroup) continue;
        const participants = await this.telegramController!.getChatParticipants(group.title, group.id)
        if (filterParticipantsGroup(participants, this.mondayController.config[fillBoardId])) continue;
        const targetBoardGroup = getTargetItemGroup(group, this.mondayController.config[fillBoardId]);
        if (!targetBoardGroup) continue;
        await limiter.removeTokens(1);
        //TODO REAL VALUE HERE
        await this.createItem(targetBoard, targetBoardGroup, group, participants)
      }
    } catch (e) {
      customLog(e)
      this.sendWindowMessage({
        type: "error",
        text: e.message
      });
    }
  }


  async createItem(targetBoard: any, targetBoardGroup: any, tgGroup: any, participants: any) {
    //Get all elements ids from the board
    const elementsIds = this.mondayController!.getElementsIds(targetBoard, targetBoardGroup)
    let chatName = tgGroup.title.toString();
    let lastMsgDate = new Date(tgGroup.lastMsgDate * 1000)

    const lastMsgDateFmt = {
      date: lastMsgDate.toISOString().split('T')[0],
      time: lastMsgDate.toLocaleTimeString('en-GB'),
    }

    let chatLink = tgGroup.link;

    let query = `mutation ($board: Int!, $group: String!, $myItemName: String!, $columnVals: JSON!) { create_item (board_id: $board, group_id:$group, item_name:$myItemName, column_values:$columnVals) { id } }`;
    let vars = {
      "board": elementsIds.boardId,
      "group": elementsIds.targetGroup,
      "myItemName": chatName,
      "columnVals": JSON.stringify({
        [elementsIds.linkColumn]: chatLink,
        [elementsIds.lastMessageDate]: lastMsgDateFmt,
        [elementsIds.participantsCol]: participants ? JSON.stringify(participants) : ""
      })
    }

    await this.mondayController!.createItem(query, vars);
    // console.log(`New entry was created for chat ${chatName} | ${chatLink}`);
    this.sendWindowMessage({
      type: "info",
      text: `New entry was created for chat ${chatName} | ${chatLink}`
    });

  }


}