import {MondayBoard} from "../../../shared/types";

export const mondayConfigParams = (board: MondayBoard) => {
  let copiedBoard = JSON.parse(JSON.stringify(board)); //Perform DEEP copy on object :)))
  copiedBoard.columns.shift()
  return [
    {
      name: "board_id",
      label: "Board ID",
      helper: "Your Monday board id",
      placeholder: '234567781',
      required: true,
      values: [{title: copiedBoard.id, id: copiedBoard.id}],
      defaultValue: copiedBoard.id,
    },
    // No longer useful
    // {
    //   name:"group_name",
    //   label:"Dashboard item group name",
    //   helper:"The name of the item group inside your dashboard where the rows will be added",
    //   placeholder: 'Telegram Groups',
    //   required:true
    //   defaultValue: board.
    // },
    {
      name: "link_column",
      label: "Link column name",
      helper: "Name of the column (text type) containing the link to the chat",
      placeholder: 'link',
      required: true,
      values: copiedBoard.columns,
      defaultValue: copiedBoard.columns[0].title
    },
    {
      name: "last_date_column",
      label: "Date column name",
      helper: "Name of the column (date type) containing the last message date",
      placeholder: 'last message',
      required: true,
      values: copiedBoard.columns,
      defaultValue: copiedBoard.columns[1].title

    },
    {
      name: "participants_column",
      label: "Participants column name",
      helper: "Name of the column (text type) containing the participants list",
      placeholder: 'participants',
      required: true,
      values: copiedBoard.columns,
      defaultValue: copiedBoard.columns[2].title
    },
  ]
}
