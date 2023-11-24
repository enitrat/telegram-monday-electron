import Store from "electron-store";
import ElectronStore from "electron-store";
import { TelegramController } from "./telegram.controller";
import { MondayController } from "./monday.controller";
import { RateLimiter } from "limiter";
import {
  customLog,
  filterKeywordGroup,
  filterParticipantsGroup,
  getTargetItemGroup,
} from "../utils/helpers";
import { sendError } from "../main";
import {
  CHANNEL_CONTACTS,
  CHANNEL_CONTACTSBOTS,
  CHANNEL_EDIT_FOLDERS,
  CHANNEL_FOLDERS,
  CHANNEL_GROUPS,
  CHANNEL_USERS,
  CHANNEL_LAST_MESSAGE,
  CHANNEL_LAST_MESSAGES,
  CHANNEL_MARK_AS_READ,
  CHANNEL_MESSAGE_SENT,
  CHANNEL_PARTICIPANTS,
} from "../../shared/constants";
import bigInt from "big-integer";
import {
  DialogModel,
  FolderModel,
  ParticipantPlusDate,
} from "../../shared/types";

const limiter = new RateLimiter({ tokensPerInterval: 40, interval: "minute" });

interface ReceivedId {
  value: number;
}

const formatStore = (store) => {
  if (Object.keys(store).length === 0) return undefined;
  return store;
};

export default class Controller {
  public windowChannel: Electron.WebContents;
  private readonly _mondayStore: ElectronStore;
  private readonly _keyStore: ElectronStore;
  private readonly _optionalStore: ElectronStore;
  private scanInterval;
  public telegramController: TelegramController | undefined;
  public mondayController: MondayController | undefined;

  constructor(windowChannel: Electron.WebContents) {
    this.windowChannel = windowChannel;
    this._keyStore = new Store({ name: "keyConfig" });
    this._mondayStore = new Store({ name: "mondayConfig" });
    this._optionalStore = new Store({ name: "optionalConfig" });
  }

  //EXPOSE API//
  getApi() {
    const properties = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    return properties.reduce((endpoints: any, property) => {
      if (property === "constructor") {
        return endpoints;
      }
      endpoints[property] = (this as any)[property].bind(this);
      return endpoints;
    }, {});
  }

  //GETTERS//
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
    return formatStore(this._optionalStore.store);
    // return this._optionalStore.get('config');
  }

  getFullConfig(): any {
    return {
      ...this.getMondayConfig(),
      ...this.getOptionalConfig(),
    };
  }

  //SETTERS//
  setKeyConfig(config: any) {
    if (!config) {
      this.mondayController = undefined;
      this._keyStore.clear();
    } else {
      this._keyStore.set(config);
    }
    //TODO check this
    this.mondayController = new MondayController(
      this.getKeyConfig().MONDAY_API_KEY,
      this.getFullConfig(),
    );
  }

  setMondayConfig(config: any) {
    if (!config) {
      this._mondayStore.clear();
    } else {
      this._mondayStore.set(config);
    }
    this.mondayController.config = this.getFullConfig();
  }

  setOptionalConfig(config: any) {
    if (!config) {
      this._optionalStore.clear();
    } else {
      this._optionalStore.set(config);
    }
    this.mondayController.config = this.getFullConfig();
  }

  //ELECTRON COMMUNICATION//
  sendChannelMessage(channel, message) {
    this.windowChannel.send(channel, message);
  }

  sendUpdateMessage(message) {
    this.windowChannel.send("scan_update", message);
  }

  //MONDAY FUNCTIONS//
  async getAllBoards() {
    if (!this.mondayController)
      this.mondayController = new MondayController(
        this.getKeyConfig().MONDAY_API_KEY,
        this.getFullConfig(),
      );
    const boards = await this.mondayController.getAllBoards();
    this.windowChannel.send("all_boards", boards);
  }

  async getMondayBoard() {
    const targetBoard = this.mondayController.getBoard(
      this.mondayController.config.board_id,
    );
    this.windowChannel.send("target_board", targetBoard);
  }

  /**
   * Creates a new board on a monday account
   */
  async createNewBoard() {
    clearInterval(this.scanInterval);
    if (!this.mondayController)
      this.mondayController = new MondayController(
        this.getKeyConfig().MONDAY_API_KEY,
        this.getFullConfig(),
      );
    try {
      await this.mondayController.createPreconfigBoard({});
      this.setMondayConfig(this.mondayController.config);
      this.windowChannel.send("create_board", {
        result: "success",
        data: this.getMondayConfig(),
      });
    } catch (e) {
      customLog(e);
      sendError("Couldn't create board : " + e.stack);
    }
  }

  /**
   * Gets board with specified id
   * @param id board id
   */
  async getCurrentBoard(id: string) {
    if (!this.mondayController)
      this.mondayController = new MondayController(
        this.getKeyConfig().MONDAY_API_KEY,
        this.getFullConfig(),
      );
    const currentBoard = await this.mondayController.getBoard(id);
    this.windowChannel.send("currentBoard", currentBoard);
  }

  //TELEGRAM FUNCTIONS

  async fillFolder(title: string, keyword: string) {
    try {
      const res = await this.telegramController.fillFolder(title, keyword);
      this.sendChannelMessage(CHANNEL_EDIT_FOLDERS, res);
    } catch (e) {
      customLog(e);
      sendError("Couldn't fill folders : " + e.stack);
    }
  }

  /**
   * Returns all >Groups< (no 1:1) from a telegram account
   */
  async getGroups() {
    try {
      const { fmtGroups } = await this.telegramController.getDialogs();
      this.sendChannelMessage(CHANNEL_GROUPS, fmtGroups);
    } catch (e) {
      sendError("Couldn't get dialogs : " + e.stack);
    }
  }

  async getFolders() {
    try {
      const folders: FolderModel[] = await this.telegramController.getFolders();
      this.sendChannelMessage(CHANNEL_FOLDERS, folders);
    } catch (e) {
      sendError("Couldn't get folders : " + e.stack);
    }
  }

  /**
   * Returns all participants from a group
   * @param groupId id of the group
   */
  async getGroupParticipants(groupId: string) {
    try {
      const participants =
        await this.telegramController.getChatParticipants(groupId);
      this.sendChannelMessage(CHANNEL_PARTICIPANTS, participants);
    } catch (e) {
      sendError("Couldn't get participants : " + e.stack);
    }
  }

  async getLastMessage(groupId: string) {
    let result = [];

    //console.log(groupIds.length)
    try {
      const message = await this.telegramController.getLastMessage(groupId);
      console.log("get last message in controller for group id : " + groupId);
      console.log("message fetched : " + message);

      this.sendChannelMessage(CHANNEL_LAST_MESSAGE, message);
    } catch (e) {
      sendError("Couldn't get last message : " + e.stack);
    }
  }

  async markAsRead(groupId) {
    try {
      const bigIntId = bigInt(groupId);
      console.log("mark as read in controller for group id : " + bigIntId);
      const result = await this.telegramController.markAsRead(bigIntId);
      this.sendChannelMessage(CHANNEL_MARK_AS_READ, result);
    } catch (e) {
      sendError("Couldn't mark as read : " + e.stack);
    }
  }

  async getContacts() {
    try {
      this.telegramController = new TelegramController(this.getKeyConfig());
      await this.telegramController.startClient();
      const contacts = await this.telegramController.getContacts();
      this.sendChannelMessage(CHANNEL_CONTACTS, contacts);
    } catch (e) {
      sendError("Couldn't get contacts : " + e.stack);
    }
  }

  async getContactsAndBots() {
    try {
      this.telegramController = new TelegramController(this.getKeyConfig());
      await this.telegramController.startClient();
      const contactsAndBots =
        await this.telegramController.getContactsAndBots();
      this.sendChannelMessage(CHANNEL_CONTACTSBOTS, contactsAndBots);
    } catch (e) {
      sendError("Couldn't get contacts : " + e.stack);
    }
  }

  async getOrderedByLastDMParticipants(groupId: string) {
    try {
      const participants =
        await this.telegramController.getChatParticipants(groupId);
      const dialogs = await this.telegramController.getDialogs();
      const participantsWithDates = participants.map((p) => {
        const foundDialog = dialogs.fmtPrivate.find((d) => d.id === p.id);
        if (foundDialog) {
          return {
            ...p,
            lastDM: foundDialog.lastMsgDate,
          } as ParticipantPlusDate;
        }
        return { ...p, lastDM: 0 } as ParticipantPlusDate;
      });
      const orderedParticipants = participantsWithDates.sort(
        (a: any, b: any) => {
          if (a.lastDM === b.lastDM) {
            if ((a.username || a.firstName) < (b.username || b.firstName)) {
              return 1;
            }
            if ((a.username || a.firstName) > (b.username || b.firstName)) {
              return -1;
            }
            return 0;
          }
          return a.lastDM - b.lastDM; //from oldest to newest
        },
      );
      this.sendChannelMessage(CHANNEL_PARTICIPANTS, orderedParticipants);
    } catch (e) {
      sendError("Couldn't get participants : " + e.stack);
    }
  }

  /**
   * Sends a telegram message to a user
   * @param userId id of recipient
   * @param message message to send
   */
  async sendUserMessage(userId: string, message: string) {
    try {
      await this.telegramController.sendMessage(userId, message);
      this.sendChannelMessage(CHANNEL_MESSAGE_SENT, "");
    } catch (e) {
      sendError("Couldn't send message : " + e.stack);
    }
  }

  async sendGroupMessage(groupId: string, message: string) {
    try {
      await this.telegramController.sendMessage(groupId, message);
      this.sendChannelMessage(CHANNEL_MESSAGE_SENT, "");
    } catch (e) {
      sendError("Couldn't send message : " + e.stack);
    }
  }

  /**
   * Gets 5 last messages from a chat with a user
   * @param chatId id of the chat to get messages from
   */
  async getUserLastMessages(chatId: string) {
    try {
      const messages = await this.telegramController.getLastMessages(chatId);
      this.sendChannelMessage(CHANNEL_LAST_MESSAGES, messages);
    } catch (e) {
      sendError("Couldn't get chat history : " + e.stack);
    }
  }

  async getUsersFromUsernames(usernames: string[]) {
    try {
      const ids =
        await this.telegramController.getUsersFromUsernames(usernames);
      this.sendChannelMessage(CHANNEL_USERS, ids);
    } catch (e) {
      sendError("Couldnt get ids from usernames");
    }
  }

  /**
   * Stops the telegram client and clears scanning interval
   */
  async stopTelegram() {
    clearInterval(this.scanInterval);
    await this.telegramController.stopClient();
    this.sendUpdateMessage({
      type: "info",
      text: "Telegram client stopped",
    });
  }

  //FUNCTIONNALITIES//
  //TODO More explicit here, bad function
  /**
   * Start texting page
   */
  async startAndGetGroups() {
    try {
      this.telegramController = new TelegramController(this.getKeyConfig());
      await this.telegramController.startClient();
      const newConfig = await this.telegramController.connectTelegram(
        this.getKeyConfig(),
      );
      if (newConfig) this.setKeyConfig(newConfig);
      await this.getGroups();
    } catch (e) {
      sendError("Couldn't connect to telegram : " + e.stack);
    }
  }

  logGroups(groups: DialogModel[]) {
    console.log("groups");
    console.log(groups.length);
    for (const group of groups) {
      console.log(group.title);
    }
  }

  logGroupss() {
    console.log("groupss");
    /*console.log(groups.length)
    for (const group of groups) {
      console.log(group.title)
    }*/
  }

  /**
   * Starts board filling functionnality
   * @param fillBoardId id of board to fill
   */
  async startBoardFill(fillBoardId: string) {
    try {
      clearInterval(this.scanInterval);
      this.telegramController = new TelegramController(this.getKeyConfig());
      if (!this.mondayController)
        this.mondayController = new MondayController(
          this.getKeyConfig().MONDAY_API_KEY,
          this.getFullConfig(),
        );
      await this.telegramController.startClient();
      const newConfig = await this.telegramController.connectTelegram(
        this.getKeyConfig(),
      );
      if (newConfig) this.setKeyConfig(newConfig);

      await this.startScanning(fillBoardId);
    } catch (e) {
      customLog(e);
      this.sendUpdateMessage({
        type: "error",
        text: e,
      });
      sendError(e.stack);
    }
  }

  /**
   * Starts board update functionnality.
   */
  async startBoardUpdates(usersToAdd: string[]) {
    try {
      clearInterval(this.scanInterval);
      const board_ids = this.getOptionalConfig().updated_boards.map(
        (board) => board.id,
      );
      this.telegramController = new TelegramController(this.getKeyConfig());
      if (!this.mondayController)
        this.mondayController = new MondayController(
          this.getKeyConfig().MONDAY_API_KEY,
          this.getFullConfig(),
        );
      if (!this.telegramController.telegramClient?.connected)
        await this.telegramController.startClient();
      const newConfig = await this.telegramController.connectTelegram(
        this.getKeyConfig(),
      );
      if (newConfig) this.setKeyConfig(newConfig);

      for (const id of board_ids) {
        await this.updateBoard(id, usersToAdd);
      }

      this.sendUpdateMessage({
        type: "update",
        text: "success",
      });
    } catch (e) {
      customLog(e);
      this.sendUpdateMessage({
        type: "error",
        text: "There was an error - Please check the logs and report it",
      });
      sendError(e.stack);
    }
  }

  /**
   * Starts scanning for new chats on a regular interval
   * @param fillBoardId board id to scan
   */
  async startScanning(fillBoardId) {
    // await this.updateBoard()
    await this.fillBoard(fillBoardId);

    //This gets terminated if we don't catch the error before.
    clearInterval(this.scanInterval);
    this.scanInterval = setInterval(async () => {
      await this.fillBoard(fillBoardId);
    }, 60 * 1000);
  }

  /**
   * Updates the Last Message Date column of a board element if there is a new message.
   * @param id?:string optional target board id.
   * @returns {Promise<void>}
   */
  async updateBoard(id: string, usersToAdd: string[]): Promise<void> {
    try {
      this.sendUpdateMessage({
        type: "info",
        text: "Updating board..." + id || "",
      });

      //get group accounts, private chats, and already exported chats. if no id specified => using config id.
      let { accountGroups, privateChats, exportedChats, targetBoard } =
        await this.scanGroups(id);

      for (const group of [...accountGroups, ...privateChats]) {
        try {
          // if (filterKeywordGroup(this.mondayController!.config[id], group)) continue;
          let exportedItem = exportedChats.find(
            (exportedChat: any) =>
              exportedChat.name.toLowerCase() === group.title.toLowerCase(),
          );
          if (!exportedItem) continue;
          // Only add users if the group is exported
          await this.telegramController.addUsersToGroup(group.id, usersToAdd);
          let lastMsgDate = group.lastMsgDate! * 1000;
          const exportedDate = JSON.parse(exportedItem.lastMsg);
          let parsedExportedDate = new Date(
            exportedDate.date + "T" + exportedDate.time,
          ).getTime();
          if (parsedExportedDate === lastMsgDate) {
            continue;
          }
          await limiter.removeTokens(1);
          await this.updateItem(targetBoard, group, exportedItem);
        } catch (e) {
          customLog(e);
          this.sendUpdateMessage({
            type: "error",
            text: "There was an error - Please check the logs and report it",
          });
          sendError(e.stack);
        }
      }
    } catch (e) {
      sendError("Couldn't update board : " + e.stack);
    }
  }

  /**
   * Scans telegram groups, exported chats, and gets target board details
   * @param id id of board to scan from
   */
  async scanGroups(boardId: string) {
    await limiter.removeTokens(1);
    const targetBoard = await this.mondayController!.getBoard(boardId);
    if (!targetBoard)
      throw new Error(
        `controller - scanGroups | Couldn't get Monday board with id ${boardId}`,
      );
    let exportedChats =
      await this.mondayController!.getExportedChats(targetBoard);
    if (!exportedChats)
      throw Error("controller - scanGroups | couldn't get board chats");
    const { fmtGroups: accountGroups, fmtPrivate: privateChats } =
      await this.telegramController!.getDialogs();
    return {
      accountGroups: accountGroups,
      privateChats: privateChats,
      exportedChats: exportedChats,
      targetBoard: targetBoard,
    };
  }

  /**
   * Fills a board with specific id
   * @param fillBoardId
   */
  async updateItem(targetBoard: any, group: any, item: any) {
    let lastMsgDate = new Date(group.lastMsgDate * 1000);
    const elementsIds = this.mondayController!.getElementsIds(targetBoard);
    let chatName = group.title.toString();
    let chatLink = group.link;
    const dateObject = {
      date: lastMsgDate.toISOString().split("T")[0],
      time: lastMsgDate.toLocaleTimeString("en-GB"),
    };

    let query = `mutation($board: Int!, $itemId: Int!, $columnVals: JSON!) {
      complexity{
      after
      reset_in_x_seconds
      }
      change_multiple_column_values ( board_id:$board, item_id:$itemId, column_values:$columnVals) {name}
     }`;

    let vars = {
      board: elementsIds.boardId,
      itemId: parseInt(item.id),
      columnVals: JSON.stringify({
        [elementsIds.lastMessageDate]: dateObject,
      }),
    };
    await this.mondayController!.updateItem(query, vars);
    // console.log(`chat ${chatName} was updated ! | ${chatLink}`);
    this.sendUpdateMessage({
      type: "info",
      text: `chat ${chatName} was updated ! | ${chatLink}`,
    });
  }

  async fillBoard(fillBoardId) {
    try {
      this.sendUpdateMessage({
        type: "info",
        text: "Searching for new chats in board..." + fillBoardId + "...",
      });
      //TODO here targetBoard must not come from here
      let { accountGroups, privateChats, exportedChats, targetBoard } =
        await this.scanGroups(fillBoardId);
      for (const group of [...accountGroups, ...privateChats]) {
        try {
          if (
            filterKeywordGroup(
              this.mondayController!.config[fillBoardId],
              group,
            )
          )
            continue;
          let foundGroup = exportedChats.find(
            (exportedChat: any) =>
              exportedChat.name.toLowerCase() === group.title.toLowerCase(),
          );
          if (foundGroup) continue;
          const participants =
            await this.telegramController!.getChatParticipants(group.id);
          const usernames = participants?.map(
            (participant) => participant.username,
          ); //can be undefined if no admin rights
          if (
            filterParticipantsGroup(
              usernames,
              this.mondayController.config[fillBoardId],
            )
          )
            continue;
          const targetBoardGroup = getTargetItemGroup(
            group,
            this.mondayController.config[fillBoardId],
          );
          if (!targetBoardGroup) continue;
          await limiter.removeTokens(1);
          //TODO REAL VALUE HERE
          await this.createItem(
            targetBoard,
            targetBoardGroup,
            group,
            usernames,
          );
        } catch (e) {
          customLog(e);
          this.sendUpdateMessage({
            type: "error",
            text: "There was an error - Please check the logs and report it",
          });
          sendError(e.stack);
        }
      }
    } catch (e) {
      customLog(e);
      this.sendUpdateMessage({
        type: "error",
        text: "There was an error - Please check the logs and report it",
      });
      sendError(e.stack);
    }
  }

  /**
   * Creates an item inside a board
   * @param targetBoard board
   * @param targetBoardGroup group inside board
   * @param tgGroup telegramGroup to export
   * @param participants group participants
   */
  async createItem(
    targetBoard: any,
    targetBoardGroup: any,
    tgGroup: any,
    participants: any,
  ) {
    //Get all elements ids from the board
    const elementsIds = this.mondayController!.getElementsIds(
      targetBoard,
      targetBoardGroup,
    );
    let chatName = tgGroup.title.toString();
    let lastMsgDate = new Date(tgGroup.lastMsgDate * 1000);

    const lastMsgDateFmt = {
      date: lastMsgDate.toISOString().split("T")[0],
      time: lastMsgDate.toLocaleTimeString("en-GB"),
    };

    let chatLink = tgGroup.link;

    let query = `mutation ($board: Int!, $group: String!, $myItemName: String!, $columnVals: JSON!) {
      complexity{
        after
        reset_in_x_seconds
      }
      create_item (board_id: $board, group_id:$group, item_name:$myItemName, column_values:$columnVals) { id }
      }`;
    let vars = {
      board: elementsIds.boardId,
      group: elementsIds.targetGroup,
      myItemName: chatName,
      columnVals: JSON.stringify({
        [elementsIds.linkColumn]: chatLink,
        [elementsIds.lastMessageDate]: lastMsgDateFmt,
        [elementsIds.participantsCol]: participants
          ? JSON.stringify(participants)
          : "",
      }),
    };

    await this.mondayController!.createItem(query, vars);
    // console.log(`New entry was created for chat ${chatName} | ${chatLink}`);
    this.sendUpdateMessage({
      type: "info",
      text: `New entry was created for chat ${chatName} | ${chatLink}`,
    });
  }
}
