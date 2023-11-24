import { Api, TelegramClient } from "telegram";
import bigInt from "big-integer";
import { waitPromptInput } from "../promptWindow";
import {
  ContactModel,
  DialogModel,
  FolderModel,
  MessageModel,
  UserModel,
} from "../../shared/types";
import { EntityLike } from "telegram/define";
import DialogFilter = Api.DialogFilter;
import Contacts = Api.contacts.Contacts;
import { TotalList } from "telegram/Helpers";
import * as messageMethods from "telegram/client/messages";
import { Dialog } from "telegram/tl/custom/dialog";
import { message } from "telegram/client";
import { Message } from "discord.js";
import BigInteger = require("big-integer");

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

  /**
   * This asynchronous function marks a chat as read in the Telegram client.
   *
   * @param {bigInt.BigInteger} chatId - The ID of the chat to be marked as read.
   *
   * @returns {Promise<boolean>} A promise that resolves to true when the chat is successfully marked as read.
   *
   * @throws {Error} If the Telegram client is not connected, the function throws an error with the message "telegramService - markAsRead | Telegram disconnected".
   */
  async markAsRead(chatId: bigInt.BigInteger): Promise<boolean> {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - markAsRead | Telegram disconnected");
    const markAsReadParams: messageMethods.MarkAsReadParams = {
      maxId: 0,
      clearMentions: true,
    };
    console.log("marking as read");
    await this.telegramClient.markAsRead(chatId);
    return true;
    //return await this.telegramClient.markAsRead(chatId, undefined);
  }

  /**
   * Retrieves the contacts from the Telegram service.
   * @returns An array of ContactModel objects representing the contacts.
   * @throws Error if the Telegram service is disconnected.
   */
  async getContacts() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getContacts | Telegram disconnected");
    const contacts: Contacts = (await this.telegramClient.invoke(
      new Api.contacts.GetContacts({}),
    )) as any;
    return contacts.users.map((user) => {
      if (user instanceof Api.UserEmpty) return;
      return {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        id: (
          user.id as unknown as { value: bigInt.BigInteger }
        ).value.toString(),
      } as ContactModel;
    });
  }

  async addUsersToGroup(userIds: any[], groupId: string, isChannel = true) {
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
              chatId: BigInteger(groupId),
              userId: userId,
              fwdLimit: 1000,
            }),
          );
          await this.telegramClient.invoke(
            new Api.messages.EditChatAdmin({
              chatId: BigInteger(groupId),
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

  /**
   * Retrieves the folders from the Telegram client.
   * @returns A promise that resolves to an array of FolderModel objects.
   * @throws Error if the Telegram client is not connected.
   */
  async getFolders(): Promise<FolderModel[]> {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getFolders | Telegram disconnected");
    const result = await this.telegramClient.invoke(
      new Api.messages.GetDialogFilters(),
    );
    return result
      .map((folder) => {
        if (folder instanceof Api.DialogFilterDefault) return;
        const dialogIds = folder.includePeers
          ?.map((peer) => {
            if (peer instanceof Api.InputPeerEmpty) return;
            if (peer instanceof Api.InputPeerUser) return Number(peer.userId);
            if (peer instanceof Api.InputPeerChannel)
              return Number(peer.channelId);
            if (peer instanceof Api.InputPeerChat) return Number(peer.chatId);
          })
          .filter((id) => id !== undefined);
        if (folder.title)
          return { title: folder.title, peerIds: dialogIds, id: folder.id };
      })
      .filter((folder) => folder !== undefined);
  }

  /**
   * Retrieves the folders from the Telegram client, without any specific formatting.
   * @returns {Promise<DialogFilter[]>} A promise that resolves to an array of DialogFilter objects.
   * @throws {Error} If the Telegram client is not connected.
   */
  async getRawFolders() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getFolders | Telegram disconnected");
    return (await this.telegramClient.invoke(
      new Api.messages.GetDialogFilters(),
    )) as DialogFilter[];
  }

  /**
   * Retrieves dialogs from the Telegram client, without any specific formatting.
   * @returns {Promise<any[]>} An array of raw dialogs.
   * @throws {Error} If the Telegram client is not connected.
   */
  async getDialogsRaw() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getDialogsRaw | Telegram disconnected");
    let dialogs: Dialog[] = [];
    for await (const dialog of this.telegramClient.iterDialogs({})) {
      dialogs.push(dialog);
    }
    return dialogs;
  }

  async getDialogs() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getDialogs| Telegram disconnected");
    let fmtGroups: DialogModel[] = [];
    let fmtPrivate: DialogModel[] = [];
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
          id: (
            dialog.entity.id as unknown as { value: bigInt.BigInteger }
          ).value.toString(),
          date: dialog.date,
          title: fullName,
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        } as DialogModel);
      } else {
        fmtGroups.push({
          id: (
            dialog.entity.id as unknown as { value: bigInt.BigInteger }
          ).value.toString(),
          date: dialog.date,
          title: (dialog.entity as any).title, //sometime no title available
          lastMsg: dialog.message?.message,
          lastMsgDate: dialog.message?.date,
          type: dialog.entity.className,
          link: link,
        } as DialogModel);
      }
    }
    return { fmtGroups: fmtGroups, fmtPrivate: fmtPrivate };
  }

  /**
   * Retrieves the groups from the Telegram service.
   * @returns An array of telegram groups, unformatted.
   * @throws Error if the Telegram client is not connected.
   */
  async getGroups() {
    if (!this.telegramClient?.connected)
      throw Error("telegramService - getGroups| Telegram disconnected");
    let fmtGroups: Dialog[] = [];
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

  /**
   * Retrieves the participants of a chat group.
   * @param groupId - The ID of the chat group.
   * @returns A Promise that resolves to an array of UserModel objects representing the chat participants.
   * @throws Error if the Telegram client is not connected or if there is an error retrieving the participants.
   */
  async getChatParticipants(groupId: string) {
    if (!this.telegramClient?.connected)
      throw Error(
        "telegramService - getChatParticipants | Telegram disconnected",
      );
    try {
      const participants: TotalList<Api.User> =
        await this.telegramClient.getParticipants(groupId, {});
      return participants.map((participant) => {
        if (participant instanceof Api.UserEmpty) return;
        return {
          id: (
            participant.id as unknown as { value: bigInt.BigInteger }
          ).value.toString(),
          username: participant.username,
          firstName: participant.firstName,
          lastName: participant.lastName,
        } as UserModel;
      });
    } catch (e) {
      if (e.code !== 400)
        throw Error("telegramService - getChatParticipants | " + e);
    }
  }

  /**
   * Sends a message to a user.
   * @param userId - The ID of the user to send the message to.
   * @param message - The message to send.
   */
  async sendMessage(userId: string, message: string) {
    await this.telegramClient.sendMessage(userId, { message: message });
  }

  /**
   * Sends a message to a group.
   * @param group - The group to send the message to.
   * @param message - The message to send.
   */
  async sendMessageToGroup(group: EntityLike, message: string) {
    await this.telegramClient.sendMessage(group, { message: message });
  }

  /**
   * Retrieves an entity from the Telegram client based on the provided username.
   * @param username - The username of the entity to retrieve.
   * @returns A Promise that resolves to the retrieved entity.
   */
  async getEntityFromUsername(username: string) {
    return await this.telegramClient.getEntity(username);
  }

  async getLastMessages(chatId: string) {
    const messages = await this.telegramClient.getMessages(chatId, {
      limit: 5,
    });
    return messages
      .map((message) => {
        return {
          author: message.fromId ? "me" : "contact",
          text: message.message,
        } as MessageModel;
      })
      .reverse();
  }

  async getLastMessage(chatId: string): Promise<MessageModel | undefined> {
    console.log("getting last message in service");
    const messages = await this.telegramClient.getMessages(chatId, {
      limit: 1,
    });
    if (messages.length === 0) {
      return undefined;
    }
    return {
      author: messages[0].fromId ? "me" : "contact",
      text: messages[0]?.message,
    } as MessageModel;
  }
}
