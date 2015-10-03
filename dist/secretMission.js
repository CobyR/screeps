// used by explorer's is executed when room destination is reached.

module.exports = function(creep) {
  var lca = require('logCreepAction');



  switch(creep.room.name){
  case 'W11S26':
    // punch hole through wall to make accessing the source easier for
    // multi-room harvesters
    creep.memory.state = 'secret mission';
    lca(creep, '[SECRET MISSION] is to make source accessible for all');
    creep.memory.mode = 'pos';
    creep.memory.posDestination = new RoomPosition(35,16,'W11S26');
    break;
  case 'W11S25':
    creep.memory.state = "resting";
    lca(creep, 'I am home.');
    break;
  default:
    creep.memory.mode = 'pillage';
    creep.memory.state = ' wreaking havoc';
  }
}