function overrideMaximums(room, maximums){
// Let's start with the basics
  var sources = room.find(FIND_SOURCES);

  var fromRoom = Game.rooms[Memory.settings.runnerFromRoom];

  // ROOM CONTROLLER LEVEL 1
  if(room.controller && room.controller.level == 1){
    log('Room Controller is at level: ' + room.controller.level);
    log('found ' + sources.length + ' sources in this room.');
    log('maximums[harvesters] is ' + maximums.harvesters);
    if(maximums.harvesters < sources.length){
      maximums.harvesters = sources.length;
    }

  }

  if(maximums.hoarders < sources.length){
    maximums.hoarders = sources.length;
  }
  if(maximums.transporters < sources.length){
    maximums.transporters = sources.length;
  }
  if(maximums.upgraders === 0){
    maximums.upgraders = room.controller.level;
  }
  if(maximums.builders <= 0){
    maximums.builders = 1;
  }

  if(fromRoom && fromRoom.storage.store.energy > 500000 && room.name == Memory.settings.runnerToRoom){
    maximums.runners = 1;
  } else {
    maximums.runners = 0;
  }

  if(room.storage && room.storage.store.energy < 35000){
    maximums.buidlers = 0;
    maximums.upgraders = 1;
    log('Energy in ' + room.name + ' is below 35,000 (' + nwc(room.storage.store.energy) + ') builders now have a max of 0, and upgraders a max of 1.','WARNING');
  } else if(room.storage && room.storage.store.energy < 50000){
    maximums.builders -= 1;
    maximums.upgraders -= 1;
    log('Energy in ' + room.name + ' is below 50,000 (' + nwc(room.storage.store.energy) + ') reducing max # of buildrs and upgraders by 1.','WARNING');
  }

  if(room.storage && maximums.sweepers === 0){
    maximums.sweepers = 1;
  }


  room.memory.max = maximums;
  return maximums;
}