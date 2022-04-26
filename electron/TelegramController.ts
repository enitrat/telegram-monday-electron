import {StringSession} from "telegram/sessions";
import {Api, TelegramClient} from "telegram";
import {waitPromptInput} from "./helpers";
import {RateLimiter} from "limiter";
import bigInt from "big-integer";

const BASE_GROUP_URL = "https://web.telegram.org/z/#"
const limiter = new RateLimiter({tokensPerInterval: 22, interval: "minute"});

export class TelegramController {

  private readonly _apiId: number;
  private readonly _apiHash: string;
  private readonly _stringSession: StringSession;
  public telegramClient: TelegramClient;

  constructor(config: any) {
    this._apiId = parseInt(config.API_ID);
    this._apiHash = config.API_HASH;

    if (config.STRING_SESSION) {
      this._stringSession = new StringSession(config.STRING_SESSION);
    } else {
      this._stringSession = new StringSession("");
    }

    this.telegramClient = new TelegramClient(this._stringSession, this._apiId, this._apiHash, {
      connectionRetries: 5,
    });

  }


  async startClient() {
    if (!this.telegramClient) throw Error("Couldn't connect to telegram");
    await this.telegramClient.start({
      phoneNumber: async () => {
        const phoneNumber = await waitPromptInput('Please enter your phone number');
        console.log(phoneNumber)
        if (!phoneNumber) throw Error('no phone number specified')
        return phoneNumber
      },
      password: async () => {
        const password = await waitPromptInput('Please enter your password');
        if (!password) throw Error('no password number specified')
        return password
      },
      phoneCode: async () => {
        const phoneCode = await waitPromptInput('Please enter your telegram code ?');
        if (!phoneCode) throw Error('no telegram code specified')
        return phoneCode
      },
      onError: (err: any) => {
        throw Error(err)
        console.log(err)
      },
    });
  }

  async connectTelegram(config: any) {
    console.log('connecting telegram with config')
    console.log(config)
    if (!this.telegramClient) throw Error("Couldn't connect to telegram");
    await this.telegramClient.connect();
    if (!config.STRING_SESSION) {
      config.STRING_SESSION = this.telegramClient.session.save()
      return config;
    }
    return;
  }


  async scanGroups() {
    console.log("Scanning groups...");
    await limiter.removeTokens(1);
    // const targetBoard = await getBoard();
    // let exportedChats = await getExportedChats(targetBoard);
    // if (!exportedChats) throw Error("couldn't get board chats");
    // const accountGroups = await getDialogs(client);
    // return {accountGroups: accountGroups, exportedChats: exportedChats, targetBoard: targetBoard}
  }

  async getDialogs() {
    if (!this.telegramClient) throw Error("Can't connect to telegram")
    let fmtGroups = [];
      for await (const dialog of (this.telegramClient.iterDialogs)({})) {
        if (!dialog.entity) continue;
        const link = `${BASE_GROUP_URL}-${dialog.entity.id}`;

        //TODO SUPPORT FOR 1:1 USERS
        if (dialog.entity.className.toLowerCase() === "user") {
          if (dialog.entity instanceof Api.User) {
            const fullName = `${dialog.entity.firstName || dialog.entity.username} ${dialog.entity.lastName || ''}`;
            if (fullName.includes('export')) {
              console.log({
                id: dialog.entity.id,
                date: dialog.date,
                title: fullName,
                lastMsg: dialog.message?.message,
                lastMsgDate: dialog.message?.date,
                type: dialog.entity.className,
                link: link,
              })
            }
            continue
          }
        }
        //END OF USER SUPPORT

        fmtGroups.push({
          id: dialog.entity.id,
          date: dialog.date,
          title: (dialog.entity as any).title || 'no title', //sometime no title available
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        })
      }
      return fmtGroups
  }

  async getChatParticipants(groupId: bigInt.BigInteger) {
    if (!this.telegramClient) throw Error("Couldn't connect to telegram")
    const participants = await this.telegramClient.getParticipants(groupId, {});
    let fmtParticipants = participants.map((participant) => {
      // return {
      //   id: participant.id,
      //   username: participant.username,
      //   firstName: participant.firstName,
      // }
      return participant.username
    })
    return fmtParticipants
  }


}