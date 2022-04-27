import {Api, TelegramClient} from "telegram";
import bigInt from "big-integer";
import {waitPromptInput} from "../promptWindow";

const BASE_GROUP_URL = "https://web.telegram.org/z/#"


export class TelegramService {
  public telegramClient: TelegramClient;

  constructor(api_id, api_hash, string_session) {
    this.telegramClient = new TelegramClient(string_session, api_id, api_hash, {
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

  async stopClient(){
    if (!this.telegramClient) throw Error("Telegram already stopped");
    await this.telegramClient.destroy()
    this.telegramClient = undefined;
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


  async getDialogs() {
    if (!this.telegramClient.connected) throw Error("Telegram disconnected")
    let fmtGroups = [];
    let fmtPrivate =[];
    for await (const dialog of (this.telegramClient.iterDialogs)({})) {
      if (!dialog.entity) continue;
      const link = `${BASE_GROUP_URL}-${dialog.entity.id}`;

      //TODO SUPPORT FOR 1:1 USERS
      if (dialog.entity.className.toLowerCase() === "user") {
        if (dialog.entity instanceof Api.User) {
          const fullName = `${dialog.entity.firstName || dialog.entity.username} ${dialog.entity.lastName || ''}`;
            fmtPrivate.push({
              id: dialog.entity.id,
              date: dialog.date,
              title: fullName,
              lastMsg: dialog.message?.message,
              lastMsgDate: dialog.message?.date,
              type: dialog.entity.className,
              link: link,
            })
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
    return {fmtGroups:fmtGroups, fmtPrivate:fmtPrivate}
  }

  async getChatParticipants(groupName: string, groupId: bigInt.BigInteger) {
    if (!this.telegramClient.connected) throw Error("Telegram disconnected")

    try {
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
    } catch (e) {
      console.log(e)
      // if (e.code === 400) throw new Error('Admin rights required to see participants for ' + groupName)
    }
  }

}
