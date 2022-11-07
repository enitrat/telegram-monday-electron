import {Api, TelegramClient} from "telegram";
import bigInt from "big-integer";
import {waitPromptInput} from "../promptWindow";
import {CustomFolder} from "../../shared/types";
import DialogFilter = Api.DialogFilter;

const BASE_GROUP_URL = "https://web.telegram.org/z/#"


export class TelegramService {
  public telegramClient: TelegramClient;

  constructor(api_id, api_hash, string_session) {
    this.telegramClient = new TelegramClient(string_session, api_id, api_hash, {
      connectionRetries: 5,
    });
  }

  async startClient() {
    if (!this.telegramClient) throw Error("telegramService - startClient | Couldn't connect to telegram");
    await this.telegramClient.start({
      phoneNumber: async () => {
        const phoneNumber = await waitPromptInput('Please enter your phone number');
        if (!phoneNumber) throw Error('no phone number specified')
        return phoneNumber
      },
      password: async () => {
        const password = await waitPromptInput('Please enter your password');
        if (!password) throw Error('no password number specified')
        return password
      },
      phoneCode: async () => {
        const phoneCode = await waitPromptInput('Please enter your telegram code');
        if (!phoneCode) throw Error('no telegram code specified')
        return phoneCode
      },
      onError: (err: any) => {
        throw Error('telegramService - startClient |' + err)
        console.log(err)
      },
    });
  }

  async stopClient() {
    if (!this.telegramClient) throw Error("telegramService - stopClient |  Telegram already stopped");
    await this.telegramClient.destroy()
    this.telegramClient = undefined;
  }

  async connectTelegram(config: any) {
    if (!this.telegramClient) throw Error("telegramService - connectTelegram | Couldn't connect to telegram");
    await this.telegramClient.connect();
    console.log('starting tg')
    if (!config.STRING_SESSION) {
      config.STRING_SESSION = this.telegramClient?.session.save()
      return config;
    }
    return;
  }

  async fillFolder(folder: DialogFilter, peers: any[]) {
    if (!this.telegramClient) throw Error("telegramService - connectTelegram | Couldn't connect to telegram");
    const includePeers = Array.from(new Set([...peers.map((peer)=>peer.inputEntity), ...folder.includePeers])) as any;
    const result = await this.telegramClient.invoke(
      new Api.messages.UpdateDialogFilter({
        id: folder.id,
        filter: new Api.DialogFilter({
          id: folder.id,
          title: folder.title,
          pinnedPeers: folder.pinnedPeers,
          includePeers: includePeers,
          excludePeers: folder.excludePeers,
          contacts: folder.contacts,
          nonContacts: folder.nonContacts,
          groups: folder.groups,
          broadcasts: folder.broadcasts,
          bots: folder.bots,
          excludeMuted: folder.excludeMuted,
          excludeRead: folder.excludeRead,
          excludeArchived: folder.excludeArchived,
          emoticon: folder.emoticon,
        }),
      })
    );
    return result;
  }

  async getFolders(): Promise<CustomFolder[]> {
    if (!this.telegramClient?.connected) throw Error("telegramService - getFolders | Telegram disconnected")
    const result = await this.telegramClient.invoke(new Api.messages.GetDialogFilters());
    return result.flatMap((folder: any) => {
      const dialogIds = folder.includePeers?.map((peer: any) => {
        return Number(peer.userId || peer.channelId || peer.chatId)
      });
      if (folder.title) return {title: folder.title, peerIds: dialogIds, id: folder.id}
      return []
    })
  }

  async getRawFolders() {
    if (!this.telegramClient?.connected) throw Error("telegramService - getFolders | Telegram disconnected")
    return await this.telegramClient.invoke(new Api.messages.GetDialogFilters()) as DialogFilter[];
  }

  async getDialogsRaw() {
    if (!this.telegramClient?.connected) throw Error("telegramService - getDialogsRaw | Telegram disconnected")
    let dialogs = []
    for await (const dialog of (this.telegramClient.iterDialogs)({})) {
      dialogs.push(dialog)
    }
    return dialogs;
  }

  async getDialogs() {
    if (!this.telegramClient?.connected) throw Error("telegramService - getDialogs| Telegram disconnected")
    let fmtGroups = [];
    let fmtPrivate = [];
    for await (const dialog of (this.telegramClient.iterDialogs)({})) {
      if (!dialog.entity) continue;
      const link = `${BASE_GROUP_URL}-${dialog.entity.id}`;
      if ((dialog.entity instanceof Api.Chat) && (dialog.entity.participantsCount === 0)) continue;
      if (dialog.entity instanceof Api.User) {
        let lastName = dialog.entity.lastName || dialog.entity.username;
        const fullName = `${dialog.entity.firstName || ''} ${lastName}`;
        fmtPrivate.push({
          id: dialog.entity.id,
          date: dialog.date,
          title: fullName,
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        })
      } else {
        fmtGroups.push({
          id: dialog.entity.id,
          date: dialog.date,
          title: (dialog.entity as any).title,//sometime no title available
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        })
      }
    }
    return {fmtGroups: fmtGroups, fmtPrivate: fmtPrivate}
  }

  async getChatParticipants(groupId: bigInt.BigInteger) {
    if (!this.telegramClient?.connected) throw Error("telegramService - getChatParticipants | Telegram disconnected")
    try {
      const participants = await this.telegramClient.getParticipants(groupId, {});
      let fmtParticipants = participants.map((participant) => {
        return {
          id: participant.id,
          username: participant.username,
          firstName: participant.firstName,
          lastName: participant.lastName,
        }
        // return participant.username
      })
      return fmtParticipants
    } catch (e) {
      if (e.code !== 400) throw Error('telegramService - getChatParticipants | ' + e)
    }
  }

  async sendMessage(userId: bigInt.BigInteger, message: string) {
    await this.telegramClient.sendMessage(userId, {message: message});
  }

  async getIdFromUsername(username: string) {
    return await this.telegramClient.getEntity(username)
  }

  async getLastMessages(chatId: bigInt.BigInteger) {
    const messages = await this.telegramClient.getMessages(chatId, {limit: 5})
    return messages.map((message) => {
      return {
        author: message.fromId ? "me" : "contact",
        text: message.message
      }
    }).reverse()
  }

}
