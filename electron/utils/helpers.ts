export const excludeGroup = (config: any, group: any) => {

  if (
    (config.include_keyword !== "" && !group.title.toLowerCase().includes(config.include_keyword.toLowerCase())) ||
    (config.exclude_keyword !== "" && group.title.toLowerCase().includes(config.exclude_keyword.toLowerCase()))
  ) {
    console.log('bye'+ group.title)
    return true
  }
  return false;
}

