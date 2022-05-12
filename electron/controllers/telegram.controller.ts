import {StringSession} from "telegram/sessions";
import {TelegramClient} from "telegram";
import bigInt from "big-integer";
import {TelegramService} from "../services/telegram.service";

const BASE_GROUP_URL = "https://web.telegram.org/z/#"

export class TelegramController {

  private readonly _apiId: number;
  private readonly _apiHash: string;
  private readonly _stringSession: StringSession;
  public telegramClient: TelegramClient;
  private telegramService:TelegramService

  constructor(config: any) {
    this._apiId = parseInt(config.API_ID);
    this._apiHash = config.API_HASH;

    if (config.STRING_SESSION) {
      this._stringSession = new StringSession(config.STRING_SESSION);
    } else {
      this._stringSession = new StringSession("");
    }

    this.telegramService = new TelegramService(this._apiId,this._apiHash,this._stringSession);

    this.telegramClient = new TelegramClient(this._stringSession, this._apiId, this._apiHash, {
      connectionRetries: 5,
    });

  }


  async startClient() {
    await this.telegramService.startClient();
  }

  async stopClient(){
    await this.telegramService.stopClient();
  }

  async connectTelegram(config: any) {
    return await this.telegramService.connectTelegram(config);
  }

  async getDialogs() {
   return await this.telegramService.getDialogs()
  }

  async getChatParticipants(groupName: string, groupId: bigInt.BigInteger) {
    return await this.telegramService.getChatParticipants(groupName,groupId);
  }


}