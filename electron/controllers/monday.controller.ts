import {MondayService} from "../services/monday.service";
import {MondayBoard} from "../../shared/types";
import {sendError} from "../main";

type mainConfig = {
  "board_id": string,
  "group_name": string,
  "link_column": string,
  "last_date_column": string,
  "participants_column": string,
  "optional_config": optionalConfig,
}
type optionalConfig = {
  [key: string]: {
    "include_keyword": string,
    "exclude_keyword": string,
    "exclude_members": string[]
  }
}

type MondayConfig = mainConfig & optionalConfig;

export class MondayController {
  _apiKey;
  config: MondayConfig;
  base_url = "https://api.monday.com/v2"
  headers: any;
  mondayService: MondayService


  constructor(apiKey: string, config: any) {
    this._apiKey = apiKey;
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': this._apiKey
    }
    this.mondayService = new MondayService(apiKey);
  }

  setConfig(config: any) {
    this.config = config;
  }

  setConfigKey(key: string, value: any) {
    this.config[key] = value
  }

  setApiKey(value) {
    this._apiKey = value;
    this.mondayService = new MondayService(this._apiKey)
  }

  async getAllBoards() {
    try {
      return await this.mondayService.getAllBoards();
    } catch (e) {
      sendError(e.message + ' There could be a problem with your Monday API Key.')
    }
  }

  async archiveBoard(boardId) {
    await this.mondayService.archiveBoard(boardId)
  }


  async createBoard(options) {
    try {
      const newBoardId = await this.mondayService.createBoard(options)
      this.setConfigKey('board_id', newBoardId);
    } catch (e) {
      sendError(e.message + ' There could be a problem with your Monday API Key.')
    }
  }

  async createBoardGroup(options) {
    const newBoardGroup = await this.mondayService.createBoardGroup(this.config.board_id, options);
    this.setConfigKey('group_name', newBoardGroup)
  }

  async createBoardColumns(options) {
    const newColumns = await this.mondayService.createBoardColumns(this.config.board_id, options)
    newColumns.forEach((column) => {
      this.setConfigKey(column.entry, column.title)
    })
  }

  async createPreconfigBoard(options) {
    const newBoardId = await this.mondayService.createBoard({});
    const newBoardGroup = await this.mondayService.createBoardGroup(newBoardId, {});
    const newColumns = await this.mondayService.createBoardColumns(newBoardId, {});

    this.setConfigKey('board_id', newBoardId);
    this.setConfigKey('group_name', newBoardGroup)
    newColumns.forEach((column) => {
      this.setConfigKey(column.entry, column.title)
    })
  }

  async getBoard(id: string) {
    return await this.mondayService.getBoard(id);
  }

  /**
   * Returns all the chats already exported inside a board.
   * @param targetBoard
   * @returns {Promise<{name: *, lastMsg: *, id: *}[]>}
   */
  async getExportedChats(targetBoard: MondayBoard) {
    return await this.mondayService.getExportedChats(this.config.last_date_column, targetBoard)
  }

  /**
   * Given a specific board (object), returns ids for all the returned elements.
   * @param targetBoard
   * @returns {{targetGroup, participantsCol, lastMessageDate,  boardId: number, creationColumn, linkColumn}}
   */
  getElementsIds(targetBoard: MondayBoard, targetBoardGroup?: string) {
    const configColumns = {
      last_date_column: this.config.last_date_column,
      participants_column: this.config.participants_column,
      link_column: this.config.link_column
    }
    return this.mondayService.getElementsIds(configColumns, targetBoard, targetBoardGroup)
  }

  async updateItem(query: string, vars: any) {
    return await this.mondayService.updateItem(query, vars);
  }

  async createItem(query: string, vars: any) {
    return await this.mondayService.createItem(query, vars);
  }

}

