'use strict';

var isSimulation = (Game.rooms.sim !== undefined);
var p_room = null;
var room2 = null;

if(isSimulation){
  p_room = Game.rooms.sim;
} else {
  p_room = Game.rooms.W19S29;
  room2 = Game.rooms.W18S29;
}

var USE_STORAGE_THRESHOLD = 500000;
var ALLOW_SPAWN_USE = null;


module.exports.loop = function () {
  var startCpu = Game.getUsedCpu();
  ALLOW_SPAWN_USE = p_room.find(FIND_FLAGS, { filter: { name: 'USE_SPAWN', color: COLOR_WHITE}}).length;

  console.log('===== Tick ===== ');

  stayAlive(Game.spawns.Spawn1, Game.rooms.W19S29);

  var explorers = [];
  var builders = [];
  var workers = [];
  var guards = [];
  var hoarders = [];
  var sweepers = [];

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];

    if(creep.age < 25) {
      lca(creep, 'is about to die in ' + creep.age + ' ticks.');
    }

    switch(creep.memory.role) {
    case 'guard':
      guards.push(creep.id);
      break;
    case 'harvester':
      workers.push(creep.id);
      break;
    case 'upgrade':
      workers.push(creep.id);
      break;
    case 'builder':
      builders.push(creep.id);
      break;
    case 'explorer':
      explorers.push(creep.id);
      break;
    case 'hoarder':
      hoarders.push(creep.id);
      break;
    case 'sweeper':
      sweepers.push(creep.id);
      break;
    default:
      lca(creep, 'does not have a programmed role.');
      break;
    }
  }

  processGuards(guards, p_room);
  processWorkers(workers, p_room);
  processBuilders(builders, p_room);
  processHoarders(hoarders, p_room);
  processExplorers(explorers, p_room);
  processSweepers(sweepers, p_room);

  // REPORTINGS

  storageReport(p_room);
  storageReport(room2);
  console.log(' Energy: ' + nwc(p_room.energyAvailable) + ' of ' + nwc(p_room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy()));
  var rptController = p_room.controller;


  if(structureReports()){
    console.log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal));
    structureReport(p_room, STRUCTURE_RAMPART);
    structureReport(p_room, STRUCTURE_ROAD);
    structureReport(p_room, STRUCTURE_WALL);
  }

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.');

  if(Game.time % 1000 === 0){
    var noticeMessage = '';

    for(var i in Memory.creeps) {
      if(!Game.spawns.Spawn1.spawning && !Game.creeps[i]) {
        var message = '[MAINTENANCE] deleting memory for ' + i;
        console.log(message );
        noticeMessage += message + '\n';
        delete Memory.creeps[i];
      }
    }
    if(noticeMessage.length > 0) {
      Game.notify(noticeMessage);
    }
  }

  if(Game.rooms.W18S29){
    stayAlive(Game.spawns.Spawn2, Game.rooms.W18S29);
  }
  var endCpu = Game.getUsedCpu();

  console.log('all scripts completed ' + nwc(endCpu));
}


function helloWorld() {
  console.log('HELLO WORLD!');
}

function flagReports(name){
  var rptFlags = p_room.find(FIND_FLAGS, { filter: { name: name}});
  var reports = [];
  // console.log('flagReports: ' + name + ' - ' + rptFlags + ' -  ' + rptFlags.length + '.');

  for(var i in rptFlags){
    var check = rptFlags[i];
    // console.log('  ' + check.color);

    switch(check.color){
    case COLOR_WHITE:
      reports.push('global');
      break;
    case COLOR_YELLOW:
      reports.push('harvester');
      reports.push('upgrade');
      break;
    case COLOR_PURPLE:
      reports.push('hoarder');
      break;
    case COLOR_RED:
      reports.push('guard');
      break;
    case COLOR_BROWN:
      reports.push('builder');
      break;
    case COLOR_ORANGE:
      reports.push('explorer');
      break;
    case COLOR_GREEN:
      reports.push('sweeper');
      break;
    }
  }
  // console.log('     ' + reports.length + ' first ' + reports[0]);
  return reports;
}

function structureReports(){
    return p_room.find(FIND_FLAGS, { filter: {name: 'SR'}}).length;
}