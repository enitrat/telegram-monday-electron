import { DialogModel } from "../../shared/types";

const log = require("electron-log");

export const filterKeywordGroup = (config: any, group: any) => {
  //TODO FIX HERE BY ALWAYS SENDING OPTIONS FROM FRONT
  if (
    config.exclude_keyword !== "" &&
    group.title.toLowerCase().includes(config.exclude_keyword.toLowerCase())
  ) {
    return true;
  }
  return false;
};

export function filterParticipantsGroup(usernames: string[], config: any) {
  //if user doesnt have rights to see participants, then participants is undefined.
  if (!usernames) return false;
  usernames = usernames.flatMap((username) => {
    if (username) return username.toLowerCase();
    return [];
  });

  let filterGroup = false;

  if (
    usernames &&
    usernames.some((username: any) =>
      config.exclude_members.includes(username.toLowerCase()),
    )
  ) {
    filterGroup = true;
  }
  return filterGroup;
}

export function getTargetItemGroup(group: DialogModel, config: any) {
  //First check if it has a specific target group
  const findTargetGroup = config.include_keywords.find((entry: any) => {
    //If config says not to export 1:1, skip
    if (group.type === "User" && !entry.exportPrivate) return false;
    //Check if keyword in group title and if so this is the target group
    if (group.title.toLowerCase().includes(entry.value.toLowerCase()))
      return true;
  });

  const findTargetGroup2 = config.include_keywords.find((entry: any) => {
    //If config says not to export 1:1, skip
    if (group.type === "User" && !entry.exportPrivate) return false;
    //Check if keyword in group title and if so this is the target group
    if (entry.value === "") return true;
  });

  //Then check if it should be exported to default

  if (findTargetGroup) return findTargetGroup.target;
  if (findTargetGroup2) return findTargetGroup2.target;
}

export const customLog = (error: Error) => {
  try {
    log.info(error);
  } catch (e) {
    console.log(e);
  }
};
