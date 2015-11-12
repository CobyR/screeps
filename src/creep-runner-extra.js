function runnerGetEnergy(creep){
  // Validate Configuration
  if(!creep.memory.transferFromRoom){
    if(Memory.settings.runnerFromRoom && Memory.settings.runnerToRoom){
      creep.memory.transferFromRoom = Memory.settings.runnerFromRoom;
      creep.memory.transferToRoom = Memory.settings.runnerToRoom;
    } else {
      if(!Memory.settings.runnerFromRoom){
        lca(creep, 'settings.runnerFromRoom has no value.');
      }
      if(!Memory.settings.runnerToRoom){
        lca(creep, 'settings.runnerToRoom has no value.');
      }
    }
    switch(creep.room.name){
    case 'W5N12':
      creep.memory.transferFromRoom = 'W5N11';
      creep.memory.transferToRoom = 'W5N12';
      break;
    default:
      lca(creep, 'does not have roomTransfer configuration for ' + creep.room.name + '.');
      break;
    }
  } else {
    // do the job
    moveToDestinationRoom(creep, creep.memory.transferFromRoom);
  }
}

function runnerPutEnergy(creep){
  // configuration was validated before entering putEnergy state
  moveToDestinationRoom(creep, creep.memory.transferToRoom);
}