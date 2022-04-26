import fetch from "node-fetch-commonjs";


export class MondayController {
  _apiKey;
  config: any;
  base_url = "https://api.monday.com/v2"
  headers: any;


  constructor(apiKey: string, config: any) {
    this._apiKey = apiKey;
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': this._apiKey
    }
  }

  async getBoard() {
    let query = `{ boards (ids:[${this.config.board_id}]) { name id description groups {id title} columns { id title } items { id name column_values { title value } } } }`
    const accountData: any = await fetch(this.base_url, {
      method: 'post',
      headers: this.headers,
      body: JSON.stringify({
        'query': query,
      })
    })
      .then(res => res.json());
    if (accountData.errors) {
      throw new Error(`${JSON.stringify(accountData.errors)}`);
    }
    const targetBoard = accountData.data.boards[0];
    return targetBoard;
  }

  /**
   * Returns all the chats already exported inside a board.
   * @param targetBoard
   * @returns {Promise<{name: *, lastMsg: *, id: *}[]>}
   */
  async getExportedChats(targetBoard: any) {
    if (!targetBoard) throw Error('target board not found');
    const items = targetBoard.items
    if (!items) throw Error('board items not found');
    const exportedChats = items.map((item: any) => {
      let lastMsgColumn = item.column_values.find((o: any) => o.title.toLowerCase() === this.config.last_date_column.toLowerCase())
      return {
        name: item.name,
        id: item.id,
        lastMsg: lastMsgColumn?.value
      };
    })
    return exportedChats;
  }

  /**
   * Given a specific board (object), returns ids for all the returned elements.
   * @param targetBoard
   * @returns {{targetGroup, participantsCol, lastMessageDate,  boardId: number, creationColumn, linkColumn}}
   */
  getElementsIds(targetBoard: any) {
    const targetGroup = targetBoard.groups.find((o: any) => o.title.toLowerCase() === this.config.group_name.toLowerCase());
    const columns = targetBoard.columns;
    const linkColumn = columns.find((o: any) => o.title.toLowerCase() === this.config.link_column.toLowerCase());
    const lastMessageDate = columns.find((o: any) => o.title.toLowerCase() === this.config.last_date_column.toLowerCase());
    const participantsCol = columns.find((o: any) => o.title.toLowerCase() === this.config.participants_column.toLowerCase());

    const elementsIds = {
      targetGroup: targetGroup.id,
      boardId: parseInt(targetBoard.id),
      linkColumn: linkColumn.id,
      lastMessageDate: lastMessageDate.id,
      participantsCol: participantsCol.id
    }
    return elementsIds
  }

  async updateItem(query: string, vars: any) {
    const updatedItem: any = await fetch(this.base_url, {
      method: 'post',
      headers: this.headers,
      body: JSON.stringify({
        'query': query,
        'variables': JSON.stringify(vars)
      })
    })
      .then(res => res.json());
    if (updatedItem.error_code) {
      throw new Error(`${updatedItem.error_message}\n 
      Please check that all your columns are of type 'text'.`);
      return;
    }
    if (updatedItem.errors) {
      throw new Error(`${JSON.stringify(updatedItem.errors)}\n`);
    }

  }

  async createItem(query: string, vars: any) {
    const createdItem: any = await fetch(this.base_url, {
      method: 'post',
      headers: this.headers,
      body: JSON.stringify({
        'query': query,
        'variables': vars
      })
    })
      .then(res => res.json());
    if (createdItem.error_code) {
      console.log(createdItem)
      throw new Error(`${createdItem.error_message}\n 
      Please check that all your columns are of type 'text'.`);
    }
    if (createdItem.errors) {
      throw new Error(`${JSON.stringify(createdItem.errors)}\n`);
    }
  }
}

