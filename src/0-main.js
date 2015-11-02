'use strict';

var isSimulation = (Game.rooms.sim !== undefined);
var p_room = null;

if(isSimulation){
  p_room = Game.rooms.sim;
} else {
  for(var spawn in Game.spawns) {
    var username = Game.spawns[spawn].owner.username;
    p_room = Game.rooms[ALLIANCE[username].primary_room];
    break;
  }
}

var USE_STORAGE_THRESHOLD = 10000;
var ALLOW_SPAWN_USE = null;

module.exports.loop = function () {
  var startCpu = Game.getUsedCpu();

  cleanupMemory();

  ALLOW_SPAWN_USE = p_room.find(FIND_FLAGS,
                                { filter: { name: 'USE_SPAWN',
                                            color: COLOR_WHITE}}).length;

  console.log('->');
  log('=============================================================', 'Start Tick');
  log('===== ' + Game.time + '|' + Game.cpuLimit + ' ===== ', 'Start Tick');

  spawnCreeps();

  doWork();

  displayReports();
}
