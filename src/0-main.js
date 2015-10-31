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

  log('===== ' + Game.time + '|' + Game.getCpuUsed + ' ===== ', 'Start Tick');

  spawnCreeps();

  doWork();

  displayReports();
}
