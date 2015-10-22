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