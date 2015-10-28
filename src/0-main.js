'use strict';

var isSimulation = (Game.rooms.sim !== undefined);
var p_room = null;
var room2 = null;

if(isSimulation){
  p_room = Game.rooms.sim;
} else {
  p_room = Game.rooms.W5N12;
  room2 =  Game.rooms.W5N11;
}

var USE_STORAGE_THRESHOLD = 10000;
var ALLOW_SPAWN_USE = null;


module.exports.loop = function () {
  var startCpu = Game.getUsedCpu();

  cleanupMemory();

  ALLOW_SPAWN_USE = p_room.find(FIND_FLAGS,
                                { filter: { name: 'USE_SPAWN',
                                            color: COLOR_WHITE}}).length;

  log('===== Tick ===== ', 'game');

  spawnCreeps();

  doWork();

  // REPORTINGS

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
