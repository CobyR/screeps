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

function explore(creep) {
  var results = null;
  var target = null;
  lca(creep, creep.id + ' - ' + creep.memory.mode);
  switch(creep.memory.mode) {
  case 'build':
    if(creep.carry.energy === 0){
      creep.memory.state = 'fill';
    }
    switch(creep.memory.state){
    case 'fill':
      if(creep.carry.energy < creep.carryCapacity){
        var sources = creep.room.find(FIND_SOURCES);
        lca(creep, 'mining energy.');
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);

      } else {
        creep.memory.state = 'build';
      }
      break;
    case 'build':
      if(creep.carry.energy === 0) {
        creep.memory.state = 'fill';
      } else {
        var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

        if(sites.length > 0){
          lca(creep, 'building site');
          creep.moveTo(sites[0]);
          creep.build(sites[0]);
        } else {
          lca(creep, 'upgrading controller');
          creep.moveTo(creep.room.controller);
          creep.upgradeController(creep.room.controller);
        }
        break;
      }
      break;
    }
    break;
  case 'pillage':
    // lca(creep, 'pillageing in ' + creep.room.name + '.',true);
    var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
    // lca(creep, 'hostile creeps present: ' + hostileCreeps.length,true);
    if(hostileCreeps && hostileCreeps.length > 0) {
      // There are hostiles, run without concern and attack them.
      lca(creep, ' pillaging ' + hostileCreeps.length + ' hostile creeps in ' + creep.room.name + '.');
      creep.moveTo(hostileCreeps[0]);
      creep.attack(hostileCreeps[0]);
    } else {
      var hostileTargets = creep.room.find(FIND_HOSTILE_STRUCTURES);
      // lca(creep, 'hostile targets present: ' + hostileTargets.length,true);
      if(hostileTargets && hostileTargets.length > 1){
         lca(creep, ' pillaging ' + hostileTargets.length + ' hostile structures in ' + creep.room.name + '.');
        for(var x in hostileTargets) {
          target = hostileTargets[x];
          if(target.structureType != 'controller') {
            creep.moveTo(target);
            creep.attack(target);
            break;
          }
        }
      } else {
        var targets = creep.room.find(FIND_STRUCTURES);

        for(var y in targets) {
          target = targets[y];
          if(target.structureType != 'controller') {
            lca(creep, ' pillaging a ' + target.structureType + ' at ' + target.pos.x + ',' + target.pos.y + ' of '+ targets.length + ' standard structures in ' + creep.room.name + '.');
            creep.moveTo(target);
            creep.attack(target);
            break;
          }
        }
      }
    }
    break;
  case 'room':
    if(typeof creep.memory.roomDestination === 'undefined') {
      lca(creep,'is in room mode, but has no roomDestination');
    } else {
      lca(creep, 'is in room mode in room: ' + creep.pos.roomName + ' heading to ' + creep.memory.roomDestination + '.');
      if(creep.carryCapacity > 0 && creep.carry.energy != creep.carryCapacity){
        creep.moveTo(creep.room.storage);
        creep.room.storage.transferEnergy(creep);
      }else {
        results = moveToDestinationRoom(creep, creep.memory.roomDestination);

      }
    }
    break;
  case 'pos':
    if(typeof creep.memory.posDestination === 'undefined' || creep.memory.posDestination === null) {
      lca(creep,'is in pos mode, but has no posDestination');
    } else {
      // position is defined - handle movement of creep
      if(creep.pos.roomName == creep.memory.posDestination.roomName) {
        // we are in the correct room
        // 1. check to see if we have reached destination
        //    yes - stop
        //    no  - move
        if(creep.pos.x == creep.memory.posDestination.x &&
           creep.pos.y == creep.memory.posDestination.y &&
           creep.pos.roomName == creep.memory.posDestination.roomName) {
          lca(creep, 'has reached the destination.');
          //creep.memory.posDestination = null;f
        } else {
          lca(creep, 'heading to ' + creep.memory.posDestination.x + ',' + creep.memory.posDestination.y);
          creep.moveTo(creep.memory.posDestination.x, creep.memory.posDestination.y);
        }
      } else {
        lca(creep,'is not in the room matching his posDestination');
        if(creep.pos.x == 49) {
          creep.move(LEFT);
        }
        if(creep.pos.x === 0) {
          creep.move(RIGHT);
        }
        if(creep.pos.y == 49) {
          creep.move(TOP);
        }
        if(creep.pos.y === 0) {
          creep.move(BOTTOM);
        }
        creep.memory.posDestination = null;
      }

    }
    break;
  case 'target':
    // Check for appropriate destination
    if(typeof creep.memory.targetDestination === 'undefined' || creep.memory.targetDestination === null) {
      console.log(creep.name + 'is in target mode, but has no targetDestination');
    } else {
      // targetDestination is defined
      target = creep.memory.targetDestination;
      results = creep.moveTo(Game.structures[target.id]);
      if(results != OK) { console.log(creep.name + ' call to moveTo returned: ' + displayErr(results)); }
    }
    break;
  case 'controller':
    creep.moveTo(creep.room.controller);
    results = creep.claimController(creep.room.controller);
    if(results != OK) {
      console.log(creep.name + ' call to claimController returned: ' + displayErr(results));
    } else {
      creep.memory.mode = 'build';
    }
    break;
  default:
    //console.log(creep.name + ' is in ' + creep.memory.mode + ' mode (default?).');
}

    /*
    if(typeof creep.memory.roomDestination === undefined) {
         if(Game.time % 1 == 0){
             console.log( creep.name + ' is awaiting a roomDestination to be set.');
         }
     }
     else {
        if(creep.room.name != creep.memory.roomDestination) {
            var route = creep.room.findExitTo(creep.memory.roomDestination);
            if(route != ERR_NO_PATH) {
                console.log(creep.name + '\'s route is ' + route);
                creep.moveTo(creep.pos.findClosestByPath(route));
            } else {
                console.log(creep.name + ' is standing by... console please')
            }
        }
     }
     */
 }

function assignNextPosition(creep_ids) {

  console.log('assignNextPosition');
  var oldestCreep = Game.getObjectById(creep_ids[0]);

  var positions = null;
  var roomName = oldestCreep.room.name;

  switch(roomName){
    case 'W11S26':
      console.log(roomName + ' has positions to go for');
      positions = [
        new RoomPosition(35,16, roomName),
        new RoomPosition(36,16, roomName),
        new RoomPosition(34,16, roomName)
      ];
  }

  // check to see if any positions have been completed
  var positionToCheck = -1;
  if(typeof oldestCreep.memory.secretMissionStepCompleted == 'undefined' ||
     oldestCreep.memory.secretMissionStepCompleted === null) {
     positionToCheck = 0;
  } else {
    positionToCheck = oldestCreep.memory.secretMissionStepCompleted + 1;
  }
  console.log('positionToCheck ' + positionToCheck);
  lca(oldestCreep, oldestCreep.pos.x + ',' + oldestCreep.pos.y + ' vs ' + positions[positionToCheck].x + ',' + positions[positionToCheck].y);

  if(oldestCreep.pos.x == positions[positionToCheck].x && oldestCreep.pos.y == positions[positionToCheck].y) {
    console.log('the oldest creep has reached the position in question');
    // the specified position has been reached
    // set secretMissionStepCompleted to position index for all creeps passed in
    // if it is not the last position then set their next position to the next
    //   element in the array

    for(var id in creep_ids){
      var creep = Game.getObjectById(creep_ids[id]);

      creep.memory.secretMissionStepCompleted = positionToCheck;
      lca(creep, 'reassigning creeps');
      if(positionToCheck != positions.length - 1){
        creep.memory.posDestination = positions[positionToCheck +1];
      } else {
        creep.memory.posDestination = null;
        creep.memory.secretMissionStepCompleted = null;
        creep.memory.state = 'success';
        creep.memory.mode = 'pillage';
      }
    }
  } else {
    lca(oldestCreep, 'unexpected code branch');
  }
}
