'use strict';

var isSimulation = (Game.rooms.sim !== undefined);
var p_room = null;

if(isSimulation){
  p_room = Game.rooms.sim;
} else {
  var structure = null;
  _.forEach(Game.rooms, function(room){
              structure = room.find(FIND_MY_STRUCTURES)[0];
            });
  switch(structure.owner.username){
  case 'Kobier':
    p_room = Game.rooms.W5N12;
    break;
  case 'Archival':
    p_room = Game.rooms.W1S7;
    break;
  }
}

var USE_STORAGE_THRESHOLD = 10000;
var ALLOW_SPAWN_USE = null;
var USE_DROPS = null;

initializeSettings();

module.exports.loop = function () {
  var startCpu = Game.getUsedCpu();

  cleanupMemory();

  console.log('->');
  log('=============================================================', 'Start Tick');
  log('===== ' + Game.time + '|' + Game.cpuLimit + ' ===== ', 'Start Tick');

  _.forEach(Game.rooms, function (room){
    if(room.name == Memory.settings.runnerFromRoom){
      runnerFromRoom = room;
    }
    if(room.name == Memory.settings.runnerToRoom){
      runnerToRoom = room;
    }
  });

  spawnCreeps();

  doWork();

  displayReports();
}
