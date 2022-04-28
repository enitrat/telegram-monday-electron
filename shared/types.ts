export type MondayBoard = {
  name:string,
  id:string,
  description:string|null,
  groups:MondayGroup[],
  columns:MondayColumn[],
  items:any

}

export type MondayGroup = {
  id:string,
  title:string
}

export type MondayColumn = {
  id:string,
  title:string
}
