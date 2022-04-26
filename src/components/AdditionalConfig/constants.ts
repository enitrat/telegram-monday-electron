export const additionalConfigParams = [
  {
    name: "include_keyword",
    label: "Participants column name",
    helper: "If your chat contains this keyword in its name, it will be exported to Monday. If you want to export all your groups, leave empty.",
    placeholder: 'export',
    required: false
  },
  {
    name: "exclude_keyword",
    label: "Excluded keyword",
    helper: "If your chat contains this keyword in its name, it will NOT be exported to Monday. Leave empty if not necessary",
    placeholder: 'exclude',
    required: false,
  },
  {
    name: "exclude_members",
    label: "Excluded members",
    helper: " Comma-separated usernames (telegram @). If your group has any of these participant, it will NOT be exported to Monday.",
    placeholder: 'user1,user2,user3',
    required: false
  },
  {
    name: "secondary_board_id",
    label: "",
    helper: " Comma-separated usernames (telegram @). If your group has any of these participant, it will NOT be exported to Monday.",
    placeholder: 'user1,user2,user3',
    required: false
  },
]