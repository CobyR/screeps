function displayReports() {
  for( var id in Game.rooms )
  {
    var room = Game.rooms[id];
    storageReport(room);
    log('Energy ' + nwc(room.energyAvailable) + ' of ' + nwc(room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy(room)), 'Energy Report');

    var rptController = room.controller;

    if( structureReports() ){
      console.log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal));
      structureReport(p_room, STRUCTURE_RAMPART);
      structureReport(p_room, STRUCTURE_ROAD);
      structureReport(p_room, STRUCTURE_WALL);
    }
  }

  log('Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.', 'Global Control Report');

  // TODO: REMOVE THIS CODE AFTER YOU HAVE MIGRATED TO THE NEW cpuUsage format
  if( Memory.cpuUsage.length == 100 ) {
    Memory.cpuUsage = {
      samples: Memory.cpuUsage,
      average: average(Memory.cpuUsage)
    };
  } // END TODO

  // Log CPU Usage
  var endCpu = Game.getUsedCpu();
  if( Memory.cpuUsage == undefined ) { // First CPU Usage sample
    Memory.cpuUsage = { samples: [ endCpu ], average: endCpu }
  } else { // Recalculate the average with optimized algorithm
    Memory.cpuUsage.average *= Memory.cpuUsage.samples.length;
    Memory.cpuUsage - Memory.cpuUsage.samples[0];
    Memory.cpuUsage.samples.push( endCpu )
    while( Memory.cpuUsage.samples.length > (600 * 2) ) // 10 minutes worth of data
      Memory.cpuUsage.samples.shift();
    Memory.cpuUsage.average /= Memory.cpuUsage.samples.length;
  }

  log('all scripts completed ' + nwc(endCpu.toPrecision(4)) + ' of ' + Game.cpuLimit + ', average execution time for last ' + Memory.cpuUsage.length + ' ticks is ' + average(Memory.cpuUsage).toPrecision(4) + '.','End Tick');

  // Notify the player every 10 minutes for the average execution time in batch of 6 (every hour)
  if( Game.time % (600 * 2) == 0 ) {
    Game.notify( 'Average CPU Execution time is: ' + Memory.cpuUsage.average + ' for the last 10min as of ' (new Date).toUTCString(), 6);
  }
}

function creepCountReport(room, guards, warriors, medics,
                          harvesters, hoarders, sweepers, transporters,
                          upgraders, builders, explorers, unknowns, max){

  var report = '';

  if(max.harvesters > 0 || harvesters > 0){
    report += harvesters + ' of ' + max.harvesters + ' harvesters, ';
  }
  if(max.hoarders > 0 || hoarders > 0){
    report +=   hoarders   + ' of ' + max.hoarders + ' hoarders, ';
  }
  if(max.sweepers > 0 || sweepers > 0){
    report += sweepers   + ' of ' + max.sweepers + ' sweepers, ';
  }
  if(max.transporters > 0 || transporters > 0){
    report += transporters + ' of ' + max.transporters + ' transporters, ';
  }
  if(max.upgraders > 0 || upgraders > 0){
    report += upgraders + ' of ' + max.upgraders + ' upgraders, ';
  }
  if(max.builders > 0 || builders > 0){
    report +=   builders + ' of ' + max.builders + ' builders, ';
  }
  if(max.explorers > 0 || explorers > 0){
    report += explorers + ' of ' + max.explorers + ' explorers, ';
  }
  if(max.guards > 0 || guards > 0){
    report +=   guards + ' of ' + max.guards + ' guards, ';
  }
  if(max.warriors > 0 || warriors > 0){
    report +=       warriors + ' of ' + max.warriors + ' warriors, ';
  }
  if(max.medics > 0 || medics > 0){
    report +=   medics + ' of ' + max.medics + ' medics, ';
  }
  report += unknowns + ' unknown creeps.';

  log(report,room.name);
}
