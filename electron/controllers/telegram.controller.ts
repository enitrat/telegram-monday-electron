import {StringSession} from "telegram/sessions";
import {Api, TelegramClient} from "telegram";
import bigInt from "big-integer";
import {TelegramService} from "../services/telegram.service";

const BASE_GROUP_URL = "https://web.telegram.org/z/#"

export class TelegramController {

  private readonly _apiId: number;
  private readonly _apiHash: string;
  private readonly _stringSession: StringSession;
  public telegramClient: TelegramClient;
  private telegramService: TelegramService

  constructor(config: any) {
    this._apiId = parseInt(config.API_ID);
    this._apiHash = config.API_HASH;

    if (config.STRING_SESSION) {
      this._stringSession = new StringSession(config.STRING_SESSION);
    } else {
      this._stringSession = new StringSession("");
    }

    this.telegramService = new TelegramService(this._apiId, this._apiHash, this._stringSession);

    this.telegramClient = new TelegramClient(this._stringSession, this._apiId, this._apiHash, {
      connectionRetries: 5,
    });

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

  async startClient() {
    await this.telegramService.startClient();
  }

  async stopClient() {
    await this.telegramService.stopClient();
  }

  async connectTelegram(config: any) {
    return await this.telegramService.connectTelegram(config);
  }

  async addUsersToGroup(groupId: bigInt.BigInteger,userIds: string[], ) {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.addUsersToGroup(userIds, groupId);
  }

  async fillFolder(title:string,keyword:string){
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    const dialogs = await this.telegramService.getDialogsRaw();
    const selectedDialogs = dialogs.filter(dialog => dialog.title.toLowerCase().includes(keyword.toLowerCase()))
    if (selectedDialogs.length< 0) return;
    const folders = await this.telegramService.getRawFolders()
    const selectedFolder = folders.find(folder => folder.title?.toLowerCase() === title.toLowerCase())
    return await this.telegramService.fillFolder(selectedFolder,selectedDialogs)
  }

  async getFolders(){
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getFolders()
  }

  async getDialogs() {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getDialogs()
  }

  async getContacts() {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getContacts();
  }

  async getChatParticipants(groupId: bigInt.BigInteger) {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getChatParticipants(groupId);
  }

  async sendMessage(userId: bigInt.BigInteger, message: string) {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.sendMessage(userId, message);
  }

  async getLastMessages(chatId: bigInt.BigInteger) {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getLastMessages(chatId)
  }

  async getIdsFromUsernames(usernames:string[]){
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    const ids = []
    for (const username of usernames){
      const id = await this.telegramService.getIdFromUsername(username)
      console.log(id,username)
      ids.push(id)
    }
    return ids;
  }


}