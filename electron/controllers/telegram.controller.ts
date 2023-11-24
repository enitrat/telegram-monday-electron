import { StringSession } from "telegram/sessions";
import { Api, TelegramClient } from "telegram";
import bigInt from "big-integer";
import { TelegramService } from "../services/telegram.service";
import { Entity } from "telegram/define";
import { UserModel } from "../../shared/types";

const BASE_GROUP_URL = "https://web.telegram.org/z/#";

export class TelegramController {
  private readonly _apiId: number;
  private readonly _apiHash: string;
  private readonly _stringSession: StringSession;
  public telegramClient: TelegramClient;
  private telegramService: TelegramService;

  constructor(config: any) {
    this._apiId = parseInt(config.API_ID);
    this._apiHash = config.API_HASH;

    if (config.STRING_SESSION) {
      this._stringSession = new StringSession(config.STRING_SESSION);
    } else {
      this._stringSession = new StringSession("");
    }

    this.telegramService = new TelegramService(
      this._apiId,
      this._apiHash,
      this._stringSession,
    );

    this.telegramClient = new TelegramClient(
      this._stringSession,
      this._apiId,
      this._apiHash,
      {
        connectionRetries: 5,
      },
    );
  }

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

  async startClient() {
    await this.telegramService.startClient();
  }

  async stopClient() {
    await this.telegramService.stopClient();
  }

  async markAsRead(chatId: bigInt.BigInteger) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.markAsRead(chatId);
  }

  async getChatParticipants(groupId: string) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getChatParticipants(groupId);
  }

  async connectTelegram(config: any) {
    return await this.telegramService.connectTelegram(config);
  }

  async addUsersToGroup(groupId: string, userIds: string[]) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.addUsersToGroup(userIds, groupId);
  }

  async fillFolder(title: string, keyword: string) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    const dialogs = await this.telegramService.getDialogsRaw();
    const selectedDialogs = dialogs.filter((dialog) =>
      dialog.title.toLowerCase().includes(keyword.toLowerCase()),
    );
    if (selectedDialogs.length < 0) return;
    const folders = await this.telegramService.getRawFolders();
    const selectedFolder = folders.find(
      (folder) => folder.title?.toLowerCase() === title.toLowerCase(),
    );
    return await this.telegramService.fillFolder(
      selectedFolder,
      selectedDialogs,
    );
  }

  async getFolders() {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getFolders();
  }

  async getDialogs() {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getDialogs();
  }

  async getContactsAndBots() {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    const contacts = (await this.telegramService.getContacts()).map(
      (contact) => {
        return { id: contact.id, username: contact.username };
      },
    );
    const rawDialogs = await this.telegramService.getDialogsRaw();
    const bots = rawDialogs
      .map((dialog) => {
        let entity = dialog.entity;
        if (entity instanceof Api.User) {
          return {
            id: (
              entity.id as unknown as { value: bigInt.BigInteger }
            ).value.toString(),
            username: entity.username,
          };
        }
      })
      .filter((userDialog) => {
        if (userDialog.username.toLowerCase().endsWith("bot")) {
          return true;
        }
        return false;
      });
    console.log(bots);
    return [...contacts, ...bots];
  }

  async getContacts() {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getContacts();
  }

  async sendMessage(userId: string, message: string) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.sendMessage(userId, message);
  }

  /*async sendMessageToGroup (group: DialogModel, message: string) {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.sendMessageToGroup(group, message);
  }*/

  async getLastMessages(chatId: string) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getLastMessages(chatId);
  }

  async getLastMessage(chatId: string) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    return await this.telegramService.getLastMessage(chatId);
  }

  //TODO make this function also accept IDs so that there's no need to resolve the ID of an entity
  // This can then be used when importing CSVs.
  async getUsersFromUsernames(usernames: string[]) {
    if (!this.telegramService.telegramClient.connected)
      await this.connectTelegram({});
    const users: UserModel[] = [];
    for (const username of usernames) {
      const entity = await this.telegramService.getEntityFromUsername(username);
      if (entity instanceof Api.User) {
        users.push({
          username: entity.username,
          id: (
            entity.id as unknown as { value: bigInt.BigInteger }
          ).value.toString(),
          firstName: entity.firstName,
          lastName: entity.lastName,
        });
      }
    }
    return users;
  }

  /*async getGroups () {
    if (!this.telegramService.telegramClient.connected) await this.connectTelegram({});
    return await this.telegramService.getGroups();
  }*/
}
