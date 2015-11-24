// used by explorer's is executed when room destination is reached.

function roomSecretMission(creep) {
  var results = OK;

  results = processCallForReplacement(creep);

  if(results == ERR_INVALID_ARGS){
    results = processRunnerArrival(creep);
  }

  if(results == ERR_INVALID_ARGS){
     results = processSecretMission(creep);
  }
}

function processCallForReplacement(creep){
  if(creep.memory.previousRole){
    // revert to original role
    creep.memory.role = creep.memory.previousRole;
    creep.memory.previousRole = null;
    var deadCreep = Game.getObjectById(creep.memory.summonedBy.id);
    if(deadCreep){
      lca(creep, 'has arrived time to terminate ' + deadCreep.name);
      deadCreep.say('Bye! :)');
      deadCreep.suicide();
    }
    if(creep.memory.role == 'transporter'){
      creep.memory.follow = null;
    }
    creep.memory.summonadBy = null;
  } else {
    return ERR_INVALID_ARGS;
  }
}

function processSecretMission(creep){
  switch(creep.room.name){
  case 'W13N17':
    creep.memory.mode = 'reserve';
    break;
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
  case 'W4N11':
    switch(creep.memory.role){
    case 'explorer':
      creep.memory.mode = 'controller';
      break;
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
  case 'W6N8':
    switch(creep.memory.role){
    case 'explorer':
      creep.memory.mode = 'room';
      creep.memory.roomDestination = 'W6N9';
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
    creep.memory.mode = Memory.settings.explorerDestinationMode;
    creep.memory.state = Memory.settings.explorerDestinationState;
  }
}