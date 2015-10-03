module.exports = function(workers, p_room) {
  var harvest = require('harvester');
  var upgrade = require('upgrade');

  for(var id in workers) {
    var creep = Game.getObjectById(workers[id]);
    switch(creep.memory.role) {
    case 'harvester':
      harvest(creep, p_room);
      break;
    case 'upgrade':
      upgrade(creep, p_room);
      break;
    }
  }
}