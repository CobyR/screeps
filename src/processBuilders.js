var BUILDER = {
  1: [MOVE, MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, MOVE,
      WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY],
  3: [MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY],
  4: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  5: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
}

function processBuilders(builders) {

  if(builders.length > 0) {
    log('[Builders] -------------------','creep');

    var previousCreepsTargetId = null;
    var index = -1;

    for(var id in builders) {
      index++;
      var creep = Game.getObjectById(builders[id]);
      if(creep.spawning) {
        lca(creep, 'is still spawning.');
        continue;
      }

      if(typeof creep.memory.currentTarget === 'undefined') {
        creep.memory.currentTarget = null;
      }
      if(creep.memory.currentTarget === null || creep.memory.currentTarget.id == previousCreepsTargetId) {
        // lca(creep, 'current target is being cleared, someone is on it already', true)
        creep.memory.currentTarget = null;
      } else {
        // lca(creep, 'current target is being set as previous',true)
        previousCreepsTargetId = creep.memory.currentTarget.id;
      }

      buildThings(creep, index);
   }
  }
}

function spawnBuilder(spawn, room, current, max){
  spawnCreep(spawn, room, current, max, BUILDER, 'builder', 'builderCounter');
}