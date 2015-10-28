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

function spawnWorker(spawn, room, current, MAX){
  var results = OK;
  var spawnLevel = room.controller.level;

  if(!spawn){
    log('Trying to spawn in ' + room.name + ' and there is no spawn.', 'spawn');
    return ERR_INVALID_TARGET;
  }

  for(var l = spawnLevel; l >= 1; l--){
    results = spawn.canCreateCreep(WORKER[l],
                                'W' + l +
                                '_' + room.memory.workerCounter,
                                { role: 'harvest', locked: false});
    if(results == OK){
      spawnLevel = l;
      break;
    }
    if(results == ERR_NAME_EXISTS){
      log('Incrementing workerCounter for ' + room.name + ' from ' + room.memory.workerCounter + ' by 1 in check.', 'spawn');
      room.memory.workerCounter ++;
    }
  }

  if(current < MAX) {
    log('Attempting to spawn a level ' + spawnLevel + ' worker.');
    results = spawn.createCreep(WORKER[spawnLevel],
                                'W' + spawnLevel +
                                '_' + room.memory.workerCounter,
                                { role: 'upgrade', locked: false});
    if(results == OK){
      room.memory.workerCounter ++;
    } else if(results == ERR_NAME_EXISTS){
      log('Incrementing workerCounter for ' + room.name + ' from ' + room.memory.workerCounter + ' by 1 in create.','spawn');
      room.memory.workerCounter ++;
    } else {
      log('Spawning returned: ' + displayErr(results), 'spawn');
    }
  }
}