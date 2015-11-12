function runnerGetEnergy(creep){
  if(creep.carry.energy == creep.carryCapacity){
    creep.memory.state = 'putEnergy';
    lca(creep, 'my energy is full returning to my home room.');
    return OK;
  }
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
  } else {
    // do the job
    if(creep.room.name == creep.memory.transferFromRoom){
      var storage = creep.room.storage;
      lca(creep, 'moving to storage to get energy.');
      creep.moveTo(storage);
      pickupEnergy(creep);
      storage.transferEnergy(creep);

    } else {
      creep.moveTo(runnerFromRoom.storage);
      pickupEnergy(creep);
      lca(creep, 'using simplified move to storage in other room.');
    }
  }
}

function runnerPutEnergy(creep){
  // configuration was validated before entering putEnergy state
  if(creep.carry.energy === 0){
    creep.memory.state = 'getEnergy';
    lca(creep, 'my energy is empty going to the other room to get more.');
    return OK;
  }
  if(creep.room.name == creep.memory.transferToRoom){
    var storage = creep.room.storage;
    lca(creep, 'taking my ' + creep.carry.energy + ' energy to the storage in ' + creep.room.name + '.');
    creep.moveTo(storage);
    pickupEnergy(creep);
    creep.transferEnergy(storage);
  } else {
    creep.moveTo(runnerToRoom.storage);
    pickupEnergy(creep);
    lca(creep, 'using simplified move to storage in other room.');
  };
}

function processRunnerArrival(creep){
  if(creep.memory.role == 'runner'){
    lca(creep, 'processRunnerArrival code has not yet been written.');
  } else {
    return ERR_INVALID_ARGS;
  }
}
