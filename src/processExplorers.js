var EXPLORER = {
  4: [MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY,
      CARRY, CARRY, CARRY, CARRY,
      ATTACK]
}

function processExplorers(explorers) {
  if(explorers.length > 0) {
    log('[Explorers] ------------------ ' + explorers.length,'creep');
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

var explorerDestination = 'W5N11';

function spawnExplorer(spawn, room, current, max){
  var explorerName = 'E' + room.memory.explorerCounter;
  var spawnLevel = room.controller.level;
  var results = OK;
  if(current.length < max){
    log('Spawning a new explorer - ' + explorerName + '.', 'spawn');

    results = spawn.createCreep(EXPLORER[spawnLevel],
      explorerName, { role: 'explorer', mode: 'room', roomDestination: explorerDestination});
    if(results == OK || results == ERR_NAME_EXISTS) {
      room.memory.explorerCounter += 1;
    } else {
      console.log('trying to create an explorer resulted in ' + displayErr(results));
    }
  }
}