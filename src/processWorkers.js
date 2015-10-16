function processWorkers(workers, p_room) {
  var index = 0;

  log('[Workers] -------------------','creep');

  var sources = null;
  var source = null;

  for(var id in workers) {
    var creep = Game.getObjectById(workers[id]);
    index ++;

    // lca(creep, creep.room.name + ' vs ' + p_room.name, true );
    if(creep.room.name == p_room.name){
      sources = p_room.find(FIND_SOURCES);

      // lca(creep, 'is in primary room it has ' + sources.length + ' source(s).' ,true);
      if(sources.length > 1){
        if(index % 2){
          source = sources[0];
        } else {
          source = sources[1];
        }
      } else {
        source = sources[0];
      }
    } else {
      sources = creep.room.find(FIND_SOURCES);
      if(sources.length == 1){
        source = sources[0];
      } else {
        lca(creep, 'no source ?');
        return OK;
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