var WORKER = {
  1: [MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, WORK, CARRY, CARRY],
  3: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  4: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
  5: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
  6: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK]
};

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

    if(!creep.spawning){
      switch(creep.memory.role) {
      case 'harvester':
        harvest(creep, source);
        break;
      case 'upgrade':
        upgrade(creep, source);
        break;
      }
    } else {
      lca(creep, 'is still spawning.');
    }
  }
}

function spawnWorker(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             WORKER, 'worker', 'workerCounter');
}