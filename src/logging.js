function log(message, classification){
  if(!Memory.settings.log){
    return OK;
  }
  var reportFor = Memory.settings.reportFor;

  var creepReport = (reportFor.indexOf('global') > -1 );

  switch(classification){
  case 'creep':
    if(creepReport){
      console.log('[creep] ' + message);
    }
    break;
  default:
    if(classification === 'undefined'){
      classification = '';
    }
    console.log('[' + classification + '] ' + message);
  }
}

function lca(creep, message, debug) {
  var reportFor = Memory.settings.reportFor;

  var debugReport = Memory.settings.debug;

  var creepReport = (reportFor.indexOf(creep.memory.role)> -1);

  var roomReport = Memory.settings.reportForRoom;

  if(!creepReport){
    creepReport = (reportFor.indexOf('global') > -1);
  }
  if(roomReport && roomReport != creep.room.name && roomReport != 'all'){
    creepReport = null;
  }

  //console.log('creepReport: ' + creepReport + ' rpt ' + reportFor + ' role ' + creep.memory.role + ' roomReport ' + roomReport);
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
