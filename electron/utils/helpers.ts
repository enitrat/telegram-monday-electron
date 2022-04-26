
export const excludeGroup = (config:any,group:any) => {
  if ((config.include_keyword &&
      !group.title.toLowerCase().includes(config.include_keyword.toLowerCase())) ||
    (config.include_pattern && config.exclude_keyword !== "" && group.title.toLowerCase().includes(config.exclude_keyword.toLowerCase()))
  ) {
    return true
  }
  return false;
}

