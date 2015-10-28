var HOARDER = {
  1: [MOVE, WORK, WORK],
  2: [MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  3: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  4: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  5: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  6: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK]
}

function processHoarders(hoarders) {
  var HOARD_REMOTE = false;

  if(hoarders.length > 0){
    log('[Hoarders] --------------','creep');
    var i = 0;
    for(var id in hoarders) {
      var creep = Game.getObjectById(hoarders[id]);

      if(creep.spawning === true) {
        lca(creep, 'is still spawning.');
      } else {
        i++;
        // console.log( i + " " + i % 2);
        if(creep.room.name == p_room.name && i % 2 === 0 && creep.room.storage.store.energy > 100000 + creep.carryCapacity && HOARD_REMOTE === true) {
          hoardRCL(creep);
        } else {
          hoard(creep, i % 2);
        }
      }
    }
  }
}

function spawnHoarder(spawn, room, current, max){
  var results = OK;
  var spawnLevel = room.controller.level;

  results = spawn.canCreateCreep(HOARDER[spawnLevel],
                                 'H' + spawnLevel +
                                 '_' + room.memory.hoarderCounter,
                                 { role: 'hoarder', locked: true });

  if(results == ERR_NAME_EXISTS){
    log('Incrementing hoarderCounter for ' + room.name + ' from ' + room.memory.hoarderCounter + ' by 1 in check.', 'spawn');
    room.memory.hoarderCounter ++;
  }

  if(current < max){
    results = spawn.createCreep(HOARDER[spawnLevel],
      'H' + spawnLevel +
      '_' + room.memory.hoarderCounter,
      { role: 'hoarder', locked: true });

    if(results == ERR_NOT_ENOUGH_ENERGY){
      log('Spawning a new hoarder, but spawn said ' + displayErr(results), 'spawn');
    }
  }
}