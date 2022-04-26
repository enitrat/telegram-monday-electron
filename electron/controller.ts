import Store from "electron-store";
import ElectronStore from "electron-store";
import {TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import {waitPromptInput} from "./helpers";
import {TelegramController} from "./TelegramController";
import {MondayController} from "./mondayController";
import {RateLimiter} from "limiter";
import {excludeGroup} from "./utils/helpers";
import {stringify} from "ts-jest/dist/utils/json";

const limiter = new RateLimiter({tokensPerInterval: 22, interval: "minute"});


export default class Controller {
  public windowChannel: Electron.WebContents
  private readonly _mondayStore: ElectronStore;
  private readonly _keyStore: ElectronStore;
  private scanInterval;
  public telegramController: TelegramController | undefined;
  public mondayController: MondayController | undefined;


  constructor(windowChannel: Electron.WebContents) {
    this.windowChannel = windowChannel;
    this._keyStore = new Store({name: 'keyConfig'});
    this._mondayStore = new Store({name: 'mondayConfig'})
  }

  getKeyConfig(): any {
    return this._keyStore.get('config');
  }

  getMondayConfig(): any {
    return this._mondayStore.get('config');
  }

  setKeyConfig(config: any) {
    console.log('setting keys')
    this._keyStore.set('config', config)
    console.log(this._keyStore.get('config'))
  }

  setMondayConfig(config: any) {
    this._mondayStore.set('config', config);
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

  async stopTelegram(){
    clearInterval(this.scanInterval)
    await this.telegramController.stopClient();
    this.sendWindowMessage(
      JSON.stringify({
        type:"info",
        text:"Telegram client stopped"
      }))
  }

  async startTelegram() {
    try {
      this.telegramController = new TelegramController(this.getKeyConfig())
      this.mondayController = new MondayController(this.getKeyConfig().MONDAY_API_KEY, this.getMondayConfig())
      await this.telegramController.startClient()
      const newConfig = await this.telegramController.connectTelegram(this.getKeyConfig());
      if (newConfig) this.setKeyConfig(newConfig);

      await this.startScanning()
    } catch (e) {
      this.sendWindowMessage(JSON.stringify({
        type: "error",
        text: e.message
      }))
    }

  }

  async startScanning() {
    await this.updateBoard()
    await this.fillBoard();

    this.scanInterval = setInterval(async () => {
      await this.fillBoard();
    }, 60 * 1000)

  }


  async scanGroups() {
    await limiter.removeTokens(1);
    const targetBoard = await this.mondayController!.getBoard();
    if (!targetBoard) throw new Error(`Couldn't get Monday board with id ${this.mondayController?.config.board_id}`)
    let exportedChats = await this.mondayController!.getExportedChats(targetBoard);
    if (!exportedChats) throw Error("couldn't get board chats");
    const accountGroups = await this.telegramController!.getDialogs();
    return {accountGroups: accountGroups, exportedChats: exportedChats, targetBoard: targetBoard}
  }

  /**
   * Updates the Last Message Date column of a board element if there is a new message.
   * @param client
   * @returns {Promise<void>}
   */
  async updateBoard() {
    this.sendWindowMessage(JSON.stringify({
      type: "info",
      text: "Updating board..."
    }));
    let {accountGroups, exportedChats, targetBoard} = await this.scanGroups();
    for (const group of accountGroups) {
      if (excludeGroup(this.mondayController!.config, group)) continue;
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


  /**
   * Updates an item already inside the board
   * @param targetBoard Board to update
   * @param group group corresponding to the item
   * @param client TelegramClient
   * @param item item to update
   * @returns {Promise<void>}
   */
  async updateItem(targetBoard: any, group: any, item: any) {
    const client = this.telegramController?.telegramClient
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
    const updatedItem = await this.mondayController!.updateItem(query, vars)
    // console.log(`chat ${chatName} was updated ! | ${chatLink}`);
    this.sendWindowMessage(JSON.stringify({
      type: "info",
      text: `chat ${chatName} was updated ! | ${chatLink}`
    }));


  }

  async fillBoard() {
    this.sendWindowMessage(JSON.stringify({
      type: "info",
      text: "Searching for new chats..."
    }));
    const client = this.telegramController!.telegramClient;
    let {accountGroups, exportedChats, targetBoard} = await this.scanGroups();
    for (const group of accountGroups) {
      if (excludeGroup(this.mondayController!.config, group)) continue;
      let foundGroup = exportedChats.find((exportedChat: any) => exportedChat.name.toLowerCase() === group.title.toLowerCase());
      if (foundGroup) continue;
      const participants = await this.telegramController!.getChatParticipants(group.title, group.id)
      await limiter.removeTokens(1);
      await this.createItem(targetBoard, group, participants)
    }
  }

  async createItem(targetBoard: any, group: any, participants: any) {
    const client = this.telegramController?.telegramClient;
    //Get all elements ids from the board
    const elementsIds = this.mondayController!.getElementsIds(targetBoard)
    let chatName = group.title.toString();
    let lastMsgDate = new Date(group.lastMsgDate * 1000)

    const lastMsgDateFmt = {
      date: lastMsgDate.toISOString().split('T')[0],
      time: lastMsgDate.toLocaleTimeString('en-GB'),
    }

    let chatLink = group.link;

    //Don't sync the group if a member 'username' is a participant of the group.
    //Undefined participants means that the user doesn't have admin rights to see who's inside the group.
    if (participants) participants = participants.flatMap((participant: any) => {
      if (participant) return participant.toLowerCase();
      return []
    });

    if (participants && participants.some(
      (username: any) => this.mondayController!.config.exclude_members.includes(username.toLowerCase()))
    ) {
      return;
    }
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
    this.sendWindowMessage(JSON.stringify({
      type: "info",
      text: `New entry was created for chat ${chatName} | ${chatLink}`
    }));

  }


}