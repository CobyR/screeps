function initializeRoom(room){
  if(typeof room.memory.workerCounter === 'undefined') {
    room.memory.workerCounter = 0;
    room.memory.builderCounter = 0;
    room.memory.guardCounter = 0;
    room.memory.warriorCounter = 0;
    room.memory.healerCounter = 0;
    room.memory.explorerCounter = 0;
    room.memory.hoarderCounter = 0;
    room.memory.sweeperCounter = 0;
    room.memory.transporterCounter = 0;
  }
}
