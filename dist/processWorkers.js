module.exports = function(workers, p_room) {
  var harvest = require('harvester');
  var upgrade = require('upgrade');
  var index = 0;

  console.log('[Workers] -------------------');

  var sources = p_room.find(FIND_SOURCES);

  for(var id in workers) {
    var creep = Game.getObjectById(workers[id]);
    index ++;

    if(sources.length > 1){
      if(index % 2 == 0){
        source = sources[0];
      } else {
        source = sources[1];
      }
    }

    switch(creep.memory.role) {
    case 'harvester':
      harvest(creep, p_room, source);
      break;
    case 'upgrade':
      upgrade(creep, p_room, source);
      break;
    }
  }
}