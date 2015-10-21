function lca(creep, message, debug) {
  var DEBUG = false;

  if(creepReports() && debug) {
    if(DEBUG){
      console.log('  [DEBUG] ' + creep.name + '|' + creep.memory.role + ' ' + message);
    } else {
      // swallow message - debugging is turned off
    }

  } else if(creepReports()) {
    console.log('  ' + creep.name + '|' + creep.memory.role + ' (' + creep.memory.state + '|' + creep.ticksToLive + '|' + creep.room.name + ') ' + message);
  } else {
    // swallow message creepReports are turned off
  }
}