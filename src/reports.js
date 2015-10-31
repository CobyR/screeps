function displayReports(){
  _.forEach(Game.rooms, function(room){
    storageReport(room);

    log('Energy ' + nwc(room.energyAvailable) + ' of ' + nwc(room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy(room)), 'Energy Report');
  var rptController = room.controller;

  if(structureReports()){
    console.log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal));
    structureReport(p_room, STRUCTURE_RAMPART);
    structureReport(p_room, STRUCTURE_ROAD);
    structureReport(p_room, STRUCTURE_WALL);
  }

            });


  log('Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.','Global Control Report');

  var endCpu = Game.getUsedCpu();

  if(Memory.cpuUsage){
    Memory.cpuUsage.push(endCpu);
    while(Memory.cpuUsage.length > 100){
      var shifted = Memory.cpuUsage.shift();
      // log('Discarding ' + shifted, 'debug');
    }
  } else{
    Memory.cpuUsage = [];
  }
  // log(Memory.cpuUsage.length,'debug');
  log('all scripts completed ' + nwc(endCpu.toPrecision(4)) + ' of ' + Game.cpuLimit + ', average execution time for last ' + Memory.cpuUsage.length + ' ticks is ' + average(Memory.cpuUsage).toPrecision(4) + '.','End Tick');
  Game.notify(Game.time + ' tick completed in ' + nwc(endCpu),60);
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