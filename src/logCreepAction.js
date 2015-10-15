function lca(creep, message, debug) {
     if(creepReports() && debug) {
        console.log('  [DEBUG] ' + creep.name + '|' + creep.memory.role + ' ' + message);
     } else if(creepReports()) {
        console.log('  ' + creep.name + '|' + creep.memory.role + ' (' + creep.memory.state + '|' + creep.ticksToLive + ') ' + message);
     }
}