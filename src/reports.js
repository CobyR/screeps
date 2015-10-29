function displayReports(){
  storageReport(p_room);
  if(room2){
    storageReport(room2);
  }

  console.log(' Energy: ' + nwc(p_room.energyAvailable) + ' of ' + nwc(p_room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy()));
  var rptController = p_room.controller;


  if(structureReports()){
    console.log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal));
    structureReport(p_room, STRUCTURE_RAMPART);
    structureReport(p_room, STRUCTURE_ROAD);
    structureReport(p_room, STRUCTURE_WALL);
  }

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.');

  var endCpu = Game.getUsedCpu();

  console.log('all scripts completed ' + nwc(endCpu));
  Game.notify(Game.time + ' tick completed in ' + nwc(endCpu),3);
}

function creepCountReport(room, guards, warriors, medics,
                          harvesters, hoarders, sweepers, transporters,
                          upgraders, builders, explorers, unknowns, max){
  log('CREEPS ' + room.name + ': ' +
      harvesters + ' of ' + max.harvesters + ' harvesters, ' +
      hoarders   + ' of ' + max.hoarders + ' hoarders, ' +
      sweepers   + ' of ' + max.sweepers + ' sweepers, ' +
      transporters + ' of ' + max.transporters + ' transporters, ' +
      upgraders + ' of ' + max.upgraders + ' upgraders, ' +
      builders + ' of ' + max.builders + ' builders, ' +
      explorers + ' of ' + max.explorers + ' explorers, ' +
      guards + ' of ' + max.guards + ' guards, ' +
      warriors + ' of ' + max.warriors + ' warriors, ' +
      medics + ' of ' + max.medics + ' medics, ' +
      unknowns + ' unknown creeps.');

}