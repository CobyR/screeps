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

function creepCountReport(room, guards, warriors, healers,
                          harvesters, hoarders, sweepers, transporters,
                          upgraders, builders, explorers, unknowns, MAX_GUARDS,
                          MAX_WARRIORS, MAX_HEALERS, MAX_HARVESTERS,
                          MAX_HOARDERS, MAX_SWEEPERS, MAX_TRANSPORTERS,
                          MAX_UPGRADERS, MAX_BUILDERS, MAX_EXPLORERS){
  log('CREEPS ' + room.name + ': ' +
      harvesters + ' of ' + MAX_HARVESTERS + ' harvesters ' +
      hoarders   + ' of ' + MAX_HOARDERS + ' hoarders ' +
      sweepers   + ' of ' + MAX_SWEEPERS + ' sweepers ' +
      transporters + ' of ' + MAX_TRANSPORTERS + ' transporters ' +
      upgraders + ' of ' + MAX_UPGRADERS + ' upgraders ' +
      builders + ' of ' + MAX_BUILDERS + ' builders ' +
      explorers + ' of ' + MAX_EXPLORERS + ' explorers ' +
      guards + ' of ' + MAX_GUARDS + ' guards ' +
      warriors + ' of ' + MAX_WARRIORS + ' warriors ' +
      healers + ' of ' + MAX_HEALERS + ' healers.' +
      unknowns + ' unknown creeps.');

}