var EXPLORER = {
  4: [MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY,
      CARRY, CARRY, CARRY, CARRY,
      ATTACK],
  5: [MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      MOVE, MOVE, MOVE, MOVE,
      CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE,
      ATTACK, ATTACK, ATTACK, ATTACK],
  6: [MOVE, ATTACK, CARRY, WORK,
      MOVE, ATTACK, CARRY, WORK,
      MOVE, ATTACK, CARRY, WORK,
      MOVE, ATTACK, CARRY, WORK,
      MOVE, ATTACK, CARRY, WORK,
      MOVE, ATTACK, CARRY, WORK,
      MOVE, WORK, CARRY, WORK
     ]
}

var explorerDestination = Memory.settings.explorerRoomDestination;

function processExplorers(explorers, room) {
  if(!Memory.settings.explorerRoomDestination){
    Memory.settings.explorerRoomDestination = '';
  }

  if(explorers.length > 0) {
    log('[Explorers] ------------------ ' + explorers.length,'creep', room.name);
    var poss = [];
    var creep = null;

    for(var id in explorers) {
      creep = Game.getObjectById(explorers[id]);
      // split explorers into groups by their mode of operation

      switch(creep.memory.mode){
      case 'pos':
        poss.push(creep.id);
        break;
      default:
        if(!creep.memory.mode){
          creep.memory.mode = 'room';
          creep.memory.roomDestination = explorerDestination;
        }
        explore(creep);
      }
    }

    // process position based creeps as a group
    var commonDestination = '';
    var cdCreeps = [];

    for(id in poss) {
      creep = Game.getObjectById(poss[id]);
      // lca(creep, 'part of poss and my destination is ' + creep.memory.posDestination.x + ',' + creep.memory.posDestination.y,true);
      if(commonDestination === '') {
        lca(creep, 'setting common destination', true);
        commonDestination = creep.memory.posDestination;
        cdCreeps.push(creep.id);
      } else {
        cdCreeps.push(creep.id);
      }
    }

    // process the position based creeps with a commonDestination
    var goal = false;

    if(cdCreeps.length > 1) {
      // There is more than one creep with a commonDestination
      for(id in cdCreeps) {
        creep = Game.getObjectById(cdCreeps[id]);
        lca(creep, 'evaluating for goal success');

        if(creep.pos.x == commonDestination.x && creep.pos.y == commonDestination.y) {
          lca(creep, '   goal == true', true);
          goal = true;
        } else {
          lca(creep, ' goal == false - ' + commonDestination.x + ',' + commonDestination.y, true);
        }
      }

      if(goal) {
        assignNextPosition(cdCreeps);
      }
    } else {
      log('another unexepected code branch in processExplorers','creep');
    }

    // let all position based creeps do their thing
    for(id in poss) {
      creep = Game.getObjectById(poss[id]);

      explore(creep);
    }
  }
}

function spawnExplorer(spawn, room, current, max){
  var explorers = 0;
  _.forEach(Game.creeps, function (creep){
    if(creep.memory.role == 'explorer'){
      explorers ++;
    }
  });
  if(explorers < 5){
    spawnCreep(spawn, room, current, max,
             EXPLORER, 'explorer');
  } else {
    console.log('You have 5 global explorers, not spawning more at this time.');
  }

}

function explore(creep) {
  var results = null;
  var target = null;
  lca(creep, creep.id + ' - ' + creep.memory.mode);
  switch(creep.memory.mode) {
  case 'build':
    modeBuild(creep);
    break;
  case 'pillage':
    modePillage(creep);
    break;
  case 'room':
    modeRoom(creep);
    break;
  case 'pos':
    modePos(creep);
    break;
  case 'target':
    modeTarget(creep);
    break;
  case 'controller':
    modeController(creep);
    break;
  case 'reserve':
    modeReserve(creep);
    break;
  default:
    //console.log(creep.name + ' is in ' + creep.memory.mode + ' mode (default?).');
  }
}
