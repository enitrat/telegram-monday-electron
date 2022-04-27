export const excludeGroup = (config: any, group: any) => {

  console.log(group)
  console.log(config)
  //TODO FIX HERE BY ALWAYS SENDING OPTIONS FROM FRONT
  if (
    (config.include_keyword !== "" && !group.title.toLowerCase().includes(config.include_keyword.toLowerCase())) ||
    (config.exclude_keyword !== "" && group.title.toLowerCase().includes(config.exclude_keyword.toLowerCase()))
  ) {
    console.log(config.include_keyword)
    console.log(config.exclude_keyword)
    console.log('bye'+ group.title)
    return true
  }
  return false;
}

