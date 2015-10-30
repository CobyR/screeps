function overrideMaximums(room, maximums){
// Let's start with the basics
  var sources = room.find(FIND_SOURCES);

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

  room.memory.max = maximums;
  return maximums;
}