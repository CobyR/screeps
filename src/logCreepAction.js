function lca(creep, message, debug) {
  var debugFor = flagReports('DEBUG');
  var reportFor = flagReports('CR');

  var debugReport = (debugFor.indexOf('global') > -1) || (debugFor.indexOf(creep.memory.role) > -1);

  var creepReport = (reportFor.indexOf(creep.memory.role)> -1);

  if(!creepReport){
    creepReport = (reportFor.indexOf('global') > -1);
  }

  //  console.log('creepReport: ' + creepReport + ' rpt ' + reportFor + ' role ' + creep.memory.role);
  if(debug){
    if(creepReport && debugReport) {
      console.log('  [DEBUG] ' + creep.name + '|' + creep.memory.role + ' ' + message);
    }
  } else  if(creepReport) {
    console.log('  ' + creep.name + '|' + creep.memory.role + ' (' + creep.memory.state + '|' + creep.ticksToLive + '|' + creep.room.name + ') ' + message);
  } else {
    // swallow message creepReports are turned off
  }
}