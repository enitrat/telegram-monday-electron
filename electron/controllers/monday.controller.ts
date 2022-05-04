import fetch from "node-fetch-commonjs";
import {MondayService} from "../services/monday.service";

interface MondayConfig{
  "board_id":string,
  "group_name": string,
  "link_column": string,
  "last_date_column":string,
  "participants_column":string,
  "include_keyword":string,
  "exclude_keyword":string,
  "exclude_members":string[]
  "secondary_board":boolean,
  "board_id_2":string,
  "group_name_2": string,
  "link_column_2": string,
  "last_date_column_2":string,
  "participants_column_2":string,

}

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

  setConfigKey(key: string, value: string) {
    this.config[key] = value
  }

  setApiKey(value){
    this._apiKey=value;
    this.mondayService = new MondayService(this._apiKey)
  }

  async getAllBoards() {
    return await this.mondayService.getAllBoards();
  }

  async archiveBoard(boardId) {
    await this.mondayService.archiveBoard(boardId)
  }

  async createBoard(options) {
    const newBoardId = await this.mondayService.createBoard(options)
    this.setConfigKey('board_id', newBoardId);
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

  async createPreconfigBoard(options){
    const newBoardId = await this.mondayService.createBoard({});
    const newBoardGroup = await this.mondayService.createBoardGroup(newBoardId,{});
    const newColumns = await this.mondayService.createBoardColumns(newBoardId,{});

    this.setConfigKey('board_id', newBoardId);
    this.setConfigKey('group_name', newBoardGroup)
    newColumns.forEach((column) => {
      this.setConfigKey(column.entry, column.title)
    })
  }

  async getBoard() {
    return await this.mondayService.getBoard(this.config.board_id);
  }

  async getSecondBoard(){
    if(!this.config.secondary_board) return
    return await this.mondayService.getBoard(this.config.board_id_2);
  }

  /**
   * Returns all the chats already exported inside a board.
   * @param targetBoard
   * @returns {Promise<{name: *, lastMsg: *, id: *}[]>}
   */
  async getExportedChats(targetBoard: any) {
    return await this.mondayService.getExportedChats(this.config, targetBoard)
  }

  /**
   * Given a specific board (object), returns ids for all the returned elements.
   * @param targetBoard
   * @returns {{targetGroup, participantsCol, lastMessageDate,  boardId: number, creationColumn, linkColumn}}
   */
  getElementsIds(targetBoard: any,targetBoardGroup?:string) {
    return this.mondayService.getElementsIds(this.config, targetBoard,targetBoardGroup)
  }

  async updateItem(query: string, vars: any) {
    return await this.mondayService.updateItem(query, vars);
  }

  async createItem(query: string, vars: any) {
    return await this.mondayService.createItem(query, vars);
  }

}

