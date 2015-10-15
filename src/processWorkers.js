function processWorkers(workers, p_room) {
  var index = 0;

  log('[Workers] -------------------','creep');

  var sources = p_room.find(FIND_SOURCES);
  var source = null;

  for(var id in workers) {
    var creep = Game.getObjectById(workers[id]);
    index ++;

    if(sources.length > 1){
      if(index % 2){
        source = sources[0];
      } else {
        source = sources[1];
      }
    }

    switch(creep.memory.role) {
    case 'harvester':
      harvest(creep, source);
      break;
    case 'upgrade':
      upgrade(creep, source);
      break;
    }
  }
}