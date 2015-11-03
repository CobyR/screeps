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
    p_room = Game.rooms.W14N17;
    break;
  }
}

var USE_STORAGE_THRESHOLD = 10000;
var ALLOW_SPAWN_USE = null;

initializeSettings();

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
