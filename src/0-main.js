'use strict';

var isSimulation = (Game.rooms.sim !== undefined);

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
