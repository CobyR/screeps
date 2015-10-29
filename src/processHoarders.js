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
  spawnCreep(spawn, room, current, max,
             HOARDER, 'hoarder', 'hoarderCounter');
}