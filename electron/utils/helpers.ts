
export const excludeGroup = (config:any,group:any) => {
  if ((config.include_pattern &&
      !group.title.toLowerCase().includes(config.include_pattern.toLowerCase())) ||
    (config.include_pattern && config.exclude_pattern !== "" && group.title.toLowerCase().includes(config.exclude_pattern.toLowerCase()))
  ) {
    return true
  }
  return false;
}

