var GUARD = {
  1: [MOVE, TOUGH, TOUGH,
      MOVE, ATTACK, ATTACK],
  2: [MOVE, TOUGH, TOUGH,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK],
  3: [MOVE, TOUGH, TOUGH,
      MOVE, TOUGH, TOUGH,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK
     ],
  4: [MOVE, TOUGH, TOUGH,
      MOVE, TOUGH, TOUGH,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK],
  5:[MOVE, TOUGH, TOUGH,
     MOVE, TOUGH, TOUGH,
     MOVE, TOUGH, TOUGH,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK
    ]
}

function processGuards(guards) {
  if(guards.length > 0) {
    log('[Guards] -------------------','creep');

    for(var id in guards) {
      var creep = Game.getObjectById(guards[id]);
      if(creep.spawning) {
        lca(creep, 'is spawning.');
        return OK;
      } else {
        guardDuty(creep);
        lca(creep, 'is doing guard things.');
      }
    }
  }
}

function spawnGuard(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             GUARD, 'guard', 'guardCounter');
}
