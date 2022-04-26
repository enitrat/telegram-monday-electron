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
  {
    name:"include_keyword",
    label:"Participants column name",
    helper:"If your chat contains this keyword in its name, it will be exported to Monday. If you want to export all your groups, leave empty.",
    placeholder: 'export',
    required:false
  },
  {
    name:"exclude_keyword",
    label:"Excluded keyword",
    helper:"If your chat contains this keyword in its name, it will NOT be exported to Monday. Leave empty if not necessary",
    placeholder: 'exclude',
    required: false,
  },
  {
    name:"exclude_members",
    label:"Excluded members",
    helper:" Comma-separated usernames (telegram @). If your group has any of these participant, it will NOT be exported to Monday.",
    placeholder: 'user1,user2,user3',
    required: false
  },

]
