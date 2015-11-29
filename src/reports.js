function displayReports(){
  _.forEach(Game.rooms, function(room){
    storageReport(room);
    //console.log(' ');
    //log('Energy ' + nwc(room.energyAvailable) + ' of ' + nwc(room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy(room)), 'Energy Report');
    var rptController = room.controller;

    if(structureReports()){
      log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal), room.name);
      structureReport(room, STRUCTURE_RAMPART);
      structureReport(room, STRUCTURE_ROAD);
      structureReport(room, STRUCTURE_WALL);
    }
  });


  log('Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.','Global Control Report');

  // If the CPU Usage logging is not defined, populate it with the first sample
  var usedCpu = [];
  if( Memory.cpuUsage === undefined || Memory.cpuUsage.subSum === undefined || Memory.cpuUsage.subSum === null ) {
    usedCpu = [ Game.getUsedCpu(), (new Date()).getTime() ];
    Memory.cpuUsage = {
      subSum: usedCpu[0],
      subSamples: [ usedCpu ],
      samples: [], // 10 minute samples
      average: 0,
      tickDuration: 3.0, // Aproximate value taken from field measurement
      lastSuperSample: 0,
      lastMegaSample: 0
    }
  } else {
    var ticksFor5min = Math.round( 300 / Memory.cpuUsage.tickDuration );

    // Sum the CPU Usage
    usedCpu = [ Game.getUsedCpu(), (new Date()).getTime() ];
    Memory.cpuUsage.subSum += usedCpu[0];
    Memory.cpuUsage.subSamples.push( usedCpu );

    // Clear entries older than 5 minutes
    while ( Memory.cpuUsage.subSamples.length > ticksFor5min ) {
      Memory.cpuUsage.subSum -= Memory.cpuUsage.subSamples.shift()[0];
    }

    // Improve the average tick duration
    Memory.cpuUsage.tickDuration = (new Date()).getTime() - Memory.cpuUsage.subSamples[0][1];
    Memory.cpuUsage.tickDuration /= Memory.cpuUsage.subSamples.length * 1000;

    // Log samples based on the average for every 5 minute subsamping intervals
    if( Memory.cpuUsage.lastSuperSample + ticksFor5min <= Game.time ) {
      Memory.cpuUsage.lastSuperSample = Game.time;

      // Calculate new average
      Memory.cpuUsage.average *= Memory.cpuUsage.samples.length;
      var sample = Memory.cpuUsage.subSum / Memory.cpuUsage.subSamples.length;
      Memory.cpuUsage.average += sample;
      Memory.cpuUsage.samples.push( sample );

      // Remove old samples
      while ( Memory.cpuUsage.samples.length > 72 ) { // 6 hours
        Memory.cpuUsage.average -= Memory.cpuUsage.samples.shift();
      }

      Memory.cpuUsage.average /= Memory.cpuUsage.samples.length;

      // Reset subsamping
      usedCpu = [ Game.getUsedCpu(), (new Date()).getTime() ];
      Memory.cpuUsage.subSum = usedCpu[0];
      Memory.cpuUsage.subSamples = [ usedCpu ];

      // Every 6 hours email the user with the average CPU Usage
      var time = (new Date()).getTime();
      if( Memory.cpuUsage.lastMegaSample + 6 * 3600 * 1000 <= time ) {
        Memory.cpuUsage.lastMegaSample = time;
        Game.notify('Average CPU Usage for the last 6h as of ' + new Date() + ' was ' + (Memory.cpuUsage.average).toFixed(2) + 'ms. Game speed at the moment is: ' + (1 / Memory.cpuUsage.tickDuration).toFixed(2) + ' ticks/s.');
      }
    }
  }
}

function creepCountReport(room, guards, warriors, medics,
                          harvesters, hoarders, sweepers, transporters,
                          upgraders, builders, explorers, runners, unknowns,
                          max){

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
  if(max.runners > 0 || runners > 0){
    report += runners + ' of ' + max.runners + ' runners, ';
  }

  report += unknowns + ' unknown creeps.';

  log(report,room.name, room.name);
}
