import {filter} from "@chakra-ui/react";

export const filterKeywordGroup = (config: any, group: any) => {

  //TODO FIX HERE BY ALWAYS SENDING OPTIONS FROM FRONT
  if ( config.exclude_keyword !== "" && group.title.toLowerCase().includes(config.exclude_keyword.toLowerCase()) ) {
    return true
  }
  console.log('excludeKeyword')
  return false;
}

export function filterParticipantsGroup(participants,config){


  //if user doesnt have rights to see participants, then participants is undefined.
  if(!participants) return false;
  participants = participants.flatMap((participant: any) => {
    if (participant) return participant.toLowerCase();
    return []
  });

  let filterGroup = false

  if (participants && participants.some(
    (username: any) => config.exclude_members.includes(username.toLowerCase()))
  ) {
    filterGroup=true;
  }
  console.log('filterd : ' + filterGroup)
  return filterGroup
}


export function getTargetItemGroup(group, config){
  const findTargetGroup = config.include_keywords.find((entry)=>{
    return group.title.toLowerCase().includes(entry.value) || entry.value==="";
  })
  console.log('no target')
  if(findTargetGroup) return findTargetGroup.target;
}

