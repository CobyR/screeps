var WORKER = [];
var worker1 = [MOVE, WORK, CARRY, CARRY];
var worker2 = [MOVE, MOVE, WORK, CARRY, CARRY];
var worker3 = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK];
var worker4 = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK];
var worker5 = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];
 var worker6 = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK];

WORKER.push(worker1);
WORKER.push(worker1);
WORKER.push(worker2);
WORKER.push(worker3);
WORKER.push(worker4);
WORKER.push(worker5);
WORKER.push(worker6);

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

  for(var l = spawnLevel; l >= 1; l--){
    results = spawn.canCreateCreep(WORKER[l],
                                'W' + l +
                                '_' + room.memory.worker_counter,
                                { role: 'harvest', locked: false});
    if(results == OK){
      spawnLevel = l;
      break;
    }
    if(results == ERR_NAME_EXISTS){
      log('Incrementing worker_counter for ' + room.name + ' from ' + room.memory.worker_counter + ' by 1 in check.', 'spawn');
      room.memory.worker_counter ++;
    }
  }

  if(current < MAX) {
    log('Attempting to spawn a level ' + spawnLevel + ' worker.');
    results = spawn.createCreep(WORKER[spawnLevel],
                                'W' + spawnLevel +
                                '_' + room.memory.worker_counter,
                                { role: 'upgrade', locked: false});
    if(results == OK){
      room.memory.worker_counter ++;
    } else if(results == ERR_NAME_EXISTS){
      log('Incrementing worker_counter for ' + room.name + ' from ' + room.memory.worker_counter + ' by 1 in create.','spawn');
      room.memory.worker_counter ++;
    } else {
      log('Spawning returned: ' + displayErr(results), 'spawn');
    }
  }
}