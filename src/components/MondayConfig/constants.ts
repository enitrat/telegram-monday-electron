export const mondayConfigParams = [
  {
    name:"board_id",
    label:"Board ID",
    helper:"Your Monday board id",
    placeholder:'234567781',
    required:true
  },
  {
    name:"group_name",
    label:"Dashboard item group name",
    helper:"The name of the item group inside your dashboard where the rows will be added",
    placeholder: 'Telegram Groups',
    required:true
  },
  {
    name:"link_column",
    label:"Link column name",
    helper:"Name of the column (text type) containing the link to the chat",
    placeholder: 'link',
    required: true
  },
  {
    name:"last_date_column",
    label:"Date column name",
    helper:"Name of the column (date type) containing the last message date",
    placeholder: 'last message',
    required: true
  },
  {
    name:"participants_column",
    label:"Participants column name",
    helper:"Name of the column (text type) containing the participants list",
    placeholder: 'participants',
    required: true
  },

]
