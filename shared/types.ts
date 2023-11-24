export type MondayBoard = {
  name: string;
  id: string;
  description: string | null;
  groups: MondayGroup[];
  columns: MondayColumn[];
  items: any;
};

export type MondayGroup = {
  id: string;
  title: string;
};

export type MondayColumn = {
  id: string;
  title: string;
};

export type DialogModel = {
  date: number;
  lastMsgDate: number | undefined;
  link: string;
  lastMsg: string | undefined;
  id: string;
  title: string;
  type:
    | "UserEmpty"
    | "User"
    | "Chat"
    | "Channel"
    | "ChatEmpty"
    | "ChatForbidden"
    | "ChannelForbidden";
};

export type UserModel = {
  firstName: string;
  lastName: string;
  id: string;
  username: string;
};

export type ParticipantPlusDate = UserModel & { lastDM: number };

export interface FolderModel {
  title: string;
  peerIds: number[];
  id: number;
}

export interface ContactModel {
  username: string;
  firstName: string;
  lastName: string;
  id: string;
}

export interface MessageModel {
  author: MessageAuthor;
  text: string | undefined;
}

export type MessageAuthor = "me" | "contact";

export interface ContactOrBotModel {
  username: string;
  id: string;
}
