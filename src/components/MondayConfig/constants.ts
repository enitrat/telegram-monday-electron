export const mondayConfigParams = [
  {
    name:"board_id",
    helper:"Your Monday board id",
    placeholder:'234567781'
  },
  {
    name:"group_name",
    helper:"The name of the group inside your dashboard where the rows will be added",
    placeholder: 'Telegram Groups'
  },
  {
    name:"link_column",
    helper:"Name of the column (text type) containing the link to the chat",
    placeholder: 'link'
  },
  {
    name:"last_date_column",
    helper:"Name of the column (date type) containing the last message date",
    placeholder: 'last message'
  },
  {
    name:"participants_column",
    helper:"Name of the column (text type) containing the participants list",
    placeholder: 'participants'
  },
  {
    name:"include_pattern",
    helper:"If your chat contains this pattern in its name, it will be exported to Monday. If you want to export all your groups, leave empty.",
    placeholder: 'export'
  },
  {
    name:"exclude_pattern",
    helper:"If your chat contains this pattern in its name, it will NOT be exported to Monday. Leave empty if not necessary",
    placeholder: 'exclude'
  },
  {
    name:"exclude_members",
    helper:" Comma-separated usernames (telegram @). If your group has any of these participant, it will NOT be exported to Monday.",
    placeholder: 'user1,user2,user3'
  },

]
