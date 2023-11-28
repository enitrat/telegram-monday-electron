import fetch from "node-fetch-commonjs";
import { MondayBoard } from "../../shared/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MondayService {
  base_url = "https://api.monday.com/v2";
  headers: any;
  _apiKey;
  remainingComplexity = 1000000;
  resetInSeconds = 0;

  constructor(apiKey: string) {
    this._apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: this._apiKey,
    };
  }

  async getAllBoards(): Promise<MondayBoard[]> {
    let query = `{ boards (limit:100) { name id description groups {id title} columns { id title } } }`;

    return fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((res) => res.json())
      .then((res: any) => {
        return res.data.boards;
      });
  }

  async archiveBoard(boardId: string) {
    let query = `mutation { archive_board (board_id: ${boardId}) { id }}`;

    return fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(JSON.stringify(res, null, 2)));
  }

  async createBoard(options: any) {
    const boards = await this.getAllBoards();
    const existingBoard = boards.find(
      (board: MondayBoard) => board.name === "Telegram Board",
    );
    if (existingBoard) await this.archiveBoard(existingBoard.id);
    const boardKind = options.boardKind || "public";
    let query = `mutation { create_board (board_name: \"Telegram Board\", board_kind: ${boardKind}) {   id }}`;

    return fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((res) => res.json())
      .then((res: any) => res.data.create_board.id);
  }

  async createBoardGroup(board_id: string, options: any) {
    const group_name = options.group_name || "Telegram Chats";
    if (!board_id)
      throw Error(
        "mondayService - createBoardGroup - Can't create item in invalid board" +
          board_id,
      );
    let query = `mutation { create_group (board_id: ${board_id}, group_name: \"${group_name} \") { id title } }`;

    return fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((res) => res.json())
      .then((res: any) => {
        return res.data.create_group.title;
      });
  }

  async createBoardColumns(board_id: string, options: any) {
    if (!board_id)
      throw Error(
        "mondayService - createBoardColumns - Can't create item in invalid board" +
          board_id,
      );

    const col_details = [
      {
        name: "Link",
        type: "text",
        config_entry: "link_column",
      },
      {
        name: "Last message",
        type: "date",
        config_entry: "last_date_column",
      },
      {
        name: "Participants",
        type: "text",
        config_entry: "participants_column",
      },
    ];

    let newColumns: { entry: string; title: any }[] = [];
    for (const column of col_details) {
      let query = `mutation {create_column(board_id: ${board_id}, title:\"${column.name}\", column_type:${column.type}){id title}}`;
      const created = await fetch(this.base_url, {
        method: "post",
        headers: this.headers,
        body: JSON.stringify({
          query: query,
        }),
      })
        .then((res) => res.json())
        .then((res: any) => {
          return {
            entry: column.config_entry,
            title: res.data.create_column.title,
          };
        });
      newColumns.push(created);
    }
    return newColumns;
  }

  async checkComplexity() {
    if (this.remainingComplexity <= 50000) {
      await sleep(this.resetInSeconds * 1000);
      this.remainingComplexity = 1000000;
    }
  }

  async getBoard(board_id: string): Promise<MondayBoard> {
    await this.checkComplexity();
    let query = `{ boards (ids:[${board_id}]) { name id description groups {id title} columns { id title } items { id name column_values { title value } } } }`;
    const accountData: any = await fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
      }),
    }).then((res) => res.json());
    if (accountData.errors) {
      if (accountData.errors.includes("Not Authenticated")) {
        throw new Error(
          "Not authenticated : wrong monday API key in config. \n " +
            "Please reset API Keys config and fill in the correct value",
        );
      } else {
        throw new Error(
          " mondayService : getBoard " + JSON.stringify(accountData.errors),
        );
      }
    }
    const targetBoard = accountData.data.boards[0];
    return targetBoard;
  }

  /**
   * Returns all the chats already exported inside a board.
   * @param targetBoard
   * @returns {Promise<{name: *, lastMsg: *, id: *}[]>}
   */
  async getExportedChats(lastDateColumn: string, targetBoard: MondayBoard) {
    if (!targetBoard)
      throw Error("mondayService : getExportedChats - target board not found");
    const items = targetBoard.items;
    if (!items)
      throw Error("mondayService : getExportedChats" + "board items not found");
    const exportedChats = items.map((item: any) => {
      let lastMsgColumn = item.column_values.find(
        (o: any) => o.title.toLowerCase() === lastDateColumn.toLowerCase(),
      );
      return {
        name: item.name,
        id: item.id,
        lastMsg: lastMsgColumn?.value,
      };
    });
    return exportedChats;
  }

  /**
   * Given a specific board (object), returns ids for all the returned elements.
   * @param targetBoard
   * @returns {{targetGroup, participantsCol, lastMessageDate,  boardId: number, creationColumn, linkColumn}}
   */
  getElementsIds(
    configColumns: any,
    targetBoard: MondayBoard,
    targetBoardGroup?: string,
  ) {
    let targetGroup;
    if (targetBoardGroup) {
      targetGroup = targetBoard.groups.find(
        (o: any) => o.title.toLowerCase() === targetBoardGroup.toLowerCase(),
      );
    }
    const columns = targetBoard.columns;
    const linkColumn = columns.find(
      (o: any) =>
        o.title.toLowerCase() === configColumns.link_column.toLowerCase(),
    );
    const lastMessageDate = columns.find(
      (o: any) =>
        o.title.toLowerCase() === configColumns.last_date_column.toLowerCase(),
    );
    const participantsCol = columns.find(
      (o: any) =>
        o.title.toLowerCase() ===
        configColumns.participants_column.toLowerCase(),
    );

    const elementsIds = {
      targetGroup: targetGroup?.id || undefined,
      boardId: parseInt(targetBoard.id),
      linkColumn: linkColumn!.id,
      lastMessageDate: lastMessageDate!.id,
      participantsCol: participantsCol!.id,
    };
    return elementsIds;
  }

  async updateItem(query: string, vars: any) {
    await this.checkComplexity();
    const updatedItem: any = await fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
        variables: JSON.stringify(vars),
      }),
    }).then((res) => res.json());
    if (updatedItem.data) {
      this.remainingComplexity = updatedItem.data.complexity?.after;
      this.resetInSeconds = updatedItem.data.complexity?.reset_in_x_seconds;
    }
    if (updatedItem.error_code) {
      throw new Error(`mondayService : updateItem ${updatedItem.error_message}\n 
      `);
      return;
    }
    if (updatedItem.errors) {
      if (JSON.stringify(updatedItem.errors).includes("Complexity")) {
        return;
      } else {
        throw new Error(
          `mondayService - updateItem : ${JSON.stringify(
            updatedItem.errors,
          )}\n`,
        );
      }
    }
  }

  async createItem(query: string, vars: any) {
    await this.checkComplexity();
    const createdItem: any = await fetch(this.base_url, {
      method: "post",
      headers: this.headers,
      body: JSON.stringify({
        query: query,
        variables: vars,
      }),
    }).then((res) => res.json());
    if (createdItem.data) {
      this.remainingComplexity = createdItem.data.complexity?.after;
      this.resetInSeconds = createdItem.data.complexity?.reset_in_x_seconds;
    }
    if (createdItem.error_code) {
      throw new Error(
        ` mondayService : createItem ${createdItem.error_message}\n`,
      );
    }
    if (createdItem.errors) {
      if (JSON.stringify(createdItem.errors).includes("Complexity")) {
        return;
      } else {
        throw new Error(
          `mondayService : createItem ${JSON.stringify(createdItem.errors)}\n`,
        );
      }
    }
  }
}
