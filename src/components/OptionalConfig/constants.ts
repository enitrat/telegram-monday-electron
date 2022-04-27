export const additionalConfigParams = [
  {
    name: "include_keyword",
    label: "Included keyword",
    helper: "If your chat contains this keyword in its name, it will be exported to Monday. If you want to export all your groups, leave empty.",
    placeholder: 'export',
    required: false
  },
  {
    name: "exclude_keyword",
    label: "Excluded keyword",
    helper: "If your chat contains this keyword in its name, it will not be exported to Monday. Leave empty if not necessary",
    placeholder: 'exclude',
    required: false,
  },
  {
    name: "exclude_members",
    label: "Excluded members",
    helper: " Comma-separated usernames (telegram @). If your group has any of these participant, it will not be exported to Monday.",
    placeholder: 'user1,user2,user3',
    required: false
  },
  // {
  //   name: "secondary_board_id",
  //   label: "Secondary board",
  //   helper: " Comma-separated usernames (telegram @). If your group has any of these participant, it will NOT be exported to Monday.",
  //   placeholder: 'user1,user2,user3',
  //   required: false
  // },
]

export const secondaryBoardConfig = [
  {
    name:"board_id_2",
    label:"Board ID",
    helper:"Your second Monday board id",
    placeholder:'234567781',
    required:true
  },
  {
    name:"group_name_2",
    label:"Dashboard item group name",
    helper:"The name of the item group inside your dashboard where the rows will be added",
    placeholder: 'Telegram Groups',
    required:true
  },
  {
    name:"link_column_2",
    label:"Link column name",
    helper:"Name of the column (text type) containing the link to the chat",
    placeholder: 'link',
    required: true
  },
  {
    name:"last_date_column_2",
    label:"Date column name",
    helper:"Name of the column (date type) containing the last message date",
    placeholder: 'last message',
    required: true
  },
  {
    name:"participants_column_2",
    label:"Participants column name",
    helper:"Name of the column (text type) containing the participants list",
    placeholder: 'participants',
    required: true
  },
]