// used by explorer's is executed when room destination is reached.

function roomSecretMission(creep) {

  if(creep.memory.previousRole){
    // revert to original role
    creep.memory.role = creep.memory.previousRole;
    creep.memory.previousRole = null;
  } else {
    // no previous role, have at it.
    switch(creep.room.name){
      case 'W11S26':
        switch(creep.memory.role){
        case 'explorer':
          // punch hole through wall to make accessing the source easier for
          // multi-room harvesters
          creep.memory.state = 'secret mission';
          lca(creep, '[SECRET MISSION] is to make source accessible for all');
          creep.memory.mode = 'pos';
          creep.memory.posDestination = new RoomPosition(35,16,'W11S26');
          break;
        case 'hoarder':
          creep.memory.state = 'gathering';
        break;
        default:
          lca(creep, 'there is no secret mission defined for ' + creep.memory.role);
        }
      break;
    case 'W11S25':
      switch(creep.memory.role){
      case 'explorer':
        creep.memory.state = "resting";
        lca(creep, 'I am home.');
        break;
      }
      break;
    case 'W18S29':
      switch(creep.memory.role){
      case 'explorer':
        creep.memory.mode='build';
        creep.memory.state='fill';
        break;
      }
      break;
    case 'W5N11':
      switch(creep.memory.role){
      case 'explorer':
        creep.memory.mode = 'build';
        creep.memory.state = 'fill';
        break;
      }
      break;
    default:
      creep.memory.mode = 'pillage';
      creep.memory.state = 'destroying';
    }
  }
}