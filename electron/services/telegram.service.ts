import { Api, TelegramClient } from "telegram";
import bigInt from "big-integer";
import { waitPromptInput } from "../promptWindow";
import { CustomFolder } from "../../shared/types";
import { EntityLike } from "telegram/define";
import DialogFilter = Api.DialogFilter;
import Contacts = Api.contacts.Contacts;
import * as messageMethods from "telegram/client/messages";

const BASE_GROUP_URL = "https://web.telegram.org/z/#";

export class TelegramService {
  public telegramClient: TelegramClient;

  constructor(api_id, api_hash, string_session) {
    this.telegramClient = new TelegramClient(string_session, api_id, api_hash, {
      connectionRetries: 5,
    });
  }

  async startClient() {
    if (!this.telegramClient)
      throw Error(
        "telegramService - startClient | Couldn't connect to telegram",
      );
    await this.telegramClient.start({
      phoneNumber: async () => {
        const phoneNumber = await waitPromptInput(
          "Please enter your phone number",
        );
        if (!phoneNumber) throw Error("no phone number specified");
        return phoneNumber;
      },
      password: async () => {
        const password = await waitPromptInput("Please enter your password");
        if (!password) throw Error("no password number specified");
        return password;
      },
      phoneCode: async () => {
        const phoneCode = await waitPromptInput(
          "Please enter your telegram code",
        );
        if (!phoneCode) throw Error("no telegram code specified");
        return phoneCode;
      },
      onError: (err: any) => {
        throw Error("telegramService - startClient |" + err);
      },
    });
  }

  async stopClient() {
    if (!this.telegramClient)
      throw Error("telegramService - stopClient |  Telegram already stopped");
    await this.telegramClient.destroy();
    this.telegramClient = undefined;
  }

  async connectTelegram(config: any) {
    if (!this.telegramClient)
      throw Error(
        "telegramService - connectTelegram | Couldn't connect to telegram",
      );
    await this.telegramClient.connect();
    console.log("starting tg");
    if (!config.STRING_SESSION) {
      config.STRING_SESSION = this.telegramClient?.session.save();
      return config;
    }
    return;
  }

  async markAsRead (chatId: bigInt.BigInteger) : Promise<boolean> {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - markAsRead | Telegram disconnected");
    const markAsReadParams : messageMethods.MarkAsReadParams = {
      maxId: 0,
      clearMentions: true,
    }
    console.log("marking as read")
    await this.telegramClient.markAsRead(chatId);
    return true;
    //return await this.telegramClient.markAsRead(chatId, undefined);
  }

  async getContacts() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getContacts | Telegram disconnected");
    const contacts: Contacts = (await this.telegramClient.invoke(
      new Api.contacts.GetContacts({}),
    )) as any;
    return contacts.users.map((user: any) => {
      return {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        id: Number(user.id.value),
      };
    });
  }

  async addUsersToGroup(
    userIds: any[],
    groupId: bigInt.BigInteger,
    isChannel = true,
  ) {
    const bigintIds = userIds.map((id) => bigInt(id));
    if (isChannel) {
      try {
        await this.telegramClient.invoke(
          new Api.channels.InviteToChannel({
            channel: groupId,
            users: bigintIds,
          }),
        );
      } catch (e) {
        // If the error contains `Cannot cast InputPeerChat to any kind of InputChannel`, retry
        if (
          e.message.includes(
            "Cannot cast InputPeerChat to any kind of InputChannel",
          )
        ) {
          return this.addUsersToGroup(userIds, groupId, false);
        }
      }
      // make all of the added users admins
      for (const id of bigintIds) {
        try {
          await this.telegramClient.invoke(
            new Api.channels.EditAdmin({
              channel: groupId,
              userId: id,
              adminRights: new Api.ChatAdminRights({
                changeInfo: true,
                postMessages: true,
                editMessages: true,
                deleteMessages: true,
                banUsers: true,
                inviteUsers: true,
                pinMessages: true,
                addAdmins: true,
                anonymous: true,
                manageCall: true,
                other: true,
              }),
              rank: "",
            }),
          );
        } catch (e) {
          console.log("Admin error\n", e);
        }
      }
    } else {
      for (const userId of userIds) {
        try {
          await this.telegramClient.invoke(
            new Api.messages.AddChatUser({
              chatId: groupId,
              userId: userId,
              fwdLimit: 1000,
            }),
          );
          await this.telegramClient.invoke(
            new Api.messages.EditChatAdmin({
              chatId: groupId,
              userId: userId,
              isAdmin: true,
            }),
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  async fillFolder(folder: DialogFilter, peers: any[]) {
    if (!this.telegramClient)
      throw Error(
        "telegramService - connectTelegram | Couldn't connect to telegram",
      );
    const includePeers = Array.from(
      new Set([
        ...peers.map((peer) => peer.inputEntity),
        ...folder.includePeers,
      ]),
    ) as any;
    return await this.telegramClient.invoke(
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
      }),
    );
  }

  async getFolders(): Promise<CustomFolder[]> {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getFolders | Telegram disconnected");
    const result = await this.telegramClient.invoke(
      new Api.messages.GetDialogFilters(),
    );
    return result.flatMap((folder: any) => {
      const dialogIds = folder.includePeers?.map((peer: any) => {
        return Number(peer.userId || peer.channelId || peer.chatId);
      });
      if (folder.title)
        return { title: folder.title, peerIds: dialogIds, id: folder.id };
      return [];
    });
  }

  async getRawFolders() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getFolders | Telegram disconnected");
    return (await this.telegramClient.invoke(
      new Api.messages.GetDialogFilters(),
    )) as DialogFilter[];
  }

  async getDialogsRaw() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getDialogsRaw | Telegram disconnected");
    let dialogs = [];
    for await (const dialog of this.telegramClient.iterDialogs({})) {
      dialogs.push(dialog);
    }
    return dialogs;
  }

  async getDialogs() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getDialogs| Telegram disconnected");
    let fmtGroups = [];
    let fmtPrivate = [];
    for await (const dialog of this.telegramClient.iterDialogs({})) {
      if (!dialog.entity) continue;
      const link = `${BASE_GROUP_URL}-${dialog.entity.id}`;
      if (
        dialog.entity instanceof Api.Chat &&
        dialog.entity.participantsCount === 0
      )
        continue;
      if (dialog.entity instanceof Api.User) {
        let lastName = dialog.entity.lastName || dialog.entity.username;
        const fullName = `${dialog.entity.firstName || ""} ${lastName}`;
        fmtPrivate.push({
          id: dialog.entity.id,
          date: dialog.date,
          title: fullName,
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        });
      } else {
        fmtGroups.push({
          id: dialog.entity.id,
          date: dialog.date,
          title: (dialog.entity as any).title, //sometime no title available
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        });
      }
    }
    return { fmtGroups: fmtGroups, fmtPrivate: fmtPrivate };
  }

  async getGroups() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getGroups| Telegram disconnected");
    let fmtGroups = [];
    for await (const dialog of this.telegramClient.iterDialogs({})) {
      if (!dialog.entity) continue;
      if (
        dialog.entity instanceof Api.Chat &&
        dialog.entity.participantsCount === 0
      )
        continue;
      if (dialog.entity instanceof Api.Chat) {
        fmtGroups.push(dialog);
      }
    }
    return fmtGroups;
  }

  async getChatParticipants(groupId: bigInt.BigInteger) {
    if (!this.telegramClient?.connected)
      throw Error(
        "telegramService - getChatParticipants | Telegram disconnected",
      );
    try {
      const participants = await this.telegramClient.getParticipants(
        groupId,
        {},
      );
      return participants.map((participant) => {
        return {
          id: participant.id,
          username: participant.username,
          firstName: participant.firstName,
          lastName: participant.lastName,
        };
        // return participant.username
      });
    } catch (e) {
      if (e.code !== 400)
        throw Error("telegramService - getChatParticipants | " + e);
    }
  }

  async sendMessage(userId: bigInt.BigInteger, message: string) {
    await this.telegramClient.sendMessage(userId, { message: message });
  }

  async sendMessageToGroup(group: EntityLike, message: string) {
    await this.telegramClient.sendMessage(group, { message: message });
  }

  async getIdFromUsername(username: string) {
    return await this.telegramClient.getEntity(username);
  }

  async getLastMessages(chatId: bigInt.BigInteger) {
    const messages = await this.telegramClient.getMessages(chatId, {
      limit: 5,
    });
    return messages
      .map((message) => {
        return {
          author: message.fromId ? "me" : "contact",
          text: message.message,
        };
      })
      .reverse();
  }

  async getLastMessage(chatId: bigInt.BigInteger) {
    console.log("getting last message in service")
    const messages = await this.telegramClient.getMessages(chatId, {
      limit: 1,
    });
    console.log(messages[0].message)
    return messages[0].message;
  }
}
