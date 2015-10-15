function processGuards(guards) {
  if(guards.length > 0) {
    log('[Guards] -------------------','creep');

    for(var id in guards) {
      var creep = Game.getObjectById(guards[id]);
      protect(creep);
    }
  }
}