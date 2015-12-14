function modeBuild(creep){
  if(creep.carry.energy === 0){
    creep.memory.state = 'fill';
  }
  switch(creep.memory.state){
  case 'fill':
    if(creep.carry.energy < creep.carryCapacity){
      var source = findNearestSource(creep);
      lca(creep, 'mining energy.');
      creep.moveTo(source);
      creep.pickup(findNearestDroppedEnergy(creep,2));
      creep.harvest(source);
    } else {
      creep.memory.state = 'build';
    }
    break;
  case 'build':
    if(creep.carry.energy === 0) {
      creep.memory.state = 'fill';
    } else {
      var site = findNearestConstructionSite(creep);

      if(site){
        lca(creep, 'building site ' + site.structureType + ' at ' + site.pos.x + ',' + site.pos.y + '.');
        creep.moveTo(site);
        creep.build(site);
      } else {
        lca(creep, 'upgrading controller');
        creep.moveTo(creep.room.controller);
        creep.upgradeController(creep.room.controller);
      }
      break;
    }
    break;
/*  case 'repair':
    if(creep.carry.energy === 0){
      creep.memory.state = 'fill';
      creep.memory.previousState = 'repair';
    } else {
      var target = findMostUrgentRepair(creep);
      lca(creep, 'repairing ' + target.structureType + ' @ ' + target.pos.x + ',' + target.pos.y + '.');

      creep.moveTo(target);
    }
    break;
*/
  }
}

function modeFollow(creep){
  console.log('modeFollow for explorer.');
  if(creep.memory.followCreep){
    var target = Game.getObjectById(creep.memory.followCreep.id);

    creep.moveTo(target);
    lca(creep, 'following ' + target.name + ' at ' + target.pos.x + ',' + target.pos.y + '.');
  } else {
    lca(creep, 'is in follow mode, but you have not specified followCreep.');
  }
}

function modePillage(creep){
  var target = null;
  // lca(creep, 'pillageing in ' + creep.room.name + '.',true);
  var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
  // lca(creep, 'hostile creeps present: ' + hostileCreeps.length,true);
  if(hostileCreeps && hostileCreeps.length > 0) {
    var enemy = findNearestEnemy(creep,hostileCreeps);
    // There are hostiles, run without concern and attack them.
    lca(creep, ' pillaging ' + hostileCreeps.length + ' hostile creeps in ' + creep.room.name + '.');
    creep.moveTo(enemy);
    creep.attack(enemy);
  } else {
    var hostileTarget = findNearestEnemyTarget(creep);

    // lca(creep, 'hostile targets present: ' + hostileTargets.length,true);
    if(hostileTarget){
      if(hostileTarget.structureType != 'controller') {
        lca(creep, 'attacking: ' + hostileTarget.structureType + ' @ ' + hostileTarget.pos.x + ',' + hostileTarget.pos.y + ' it has ' + hostileTarget.hits + ' remaining.');
        creep.moveTo(hostileTarget);
        creep.attack(hostileTarget);
      } else {
        creep.moveTo(hostileTarget);
        creep.claimController(hostileTarget);
      }
    }
  }
}

function modeRoom(creep){
  var results = OK;
  if(typeof creep.memory.roomDestination === 'undefined') {
    lca(creep,'is in room mode, but has no roomDestination');
  } else {
    lca(creep, 'is in room mode in room: ' + creep.pos.roomName + ' heading to ' + creep.memory.roomDestination + '.');
    if(creep.carryCapacity > 0 && creep.carry.energy != creep.carryCapacity && creep.room.storage){
      creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep);
    }else {
      results = moveToDestinationRoom(creep, creep.memory.roomDestination);
    }
  }
}

function modePos(creep){
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
}

function modeTarget(creep){
  var results = OK;
  var target = null;
  // Check for appropriate destination
  if(typeof creep.memory.targetDestination === 'undefined' || creep.memory.targetDestination === null) {
    console.log(creep.name + 'is in target mode, but has no targetDestination');
  } else {
    // targetDestination is defined
    target = creep.memory.targetDestination;
    results = creep.moveTo(Game.structures[target.id]);
    if(results != OK) { console.log(creep.name + ' call to moveTo returned: ' + displayErr(results)); }
  }
}
function modeReserve(creep){
  var results = OK;
  if(creep.room.controller.my){
    creep.memory.mode = 'controller';
  } else {
    creep.moveTo(creep.room.controller);
    results = creep.reserveController(creep.room.controller);
    if(results != OK) {
      lca(creep,'call to reserveController returned: ' + displayErr(results));
    }
  if(results == ERR_NO_BODYPART) {
    lca(creep, 'wrong bodyparts to reserve a controller need 40x work and 1x carry, switching to build mode.');
      creep.memory.mode = 'build';
      if(creep.carry.energy > 0){
        creep.memory.state = 'build';
      } else if(creep.carryCapacity > 0){
        creep.memory.state = 'fill';
      }
    }
  }
}

function modeController(creep){
  var results = OK;
  if(creep.room.controller.my){
    creep.memory.mode = 'build';
    if(creep.carry.energy > 0){
      creep.memory.state = 'build';
    } else if(creep.carryCapacity > 0){
      creep.memory.state = 'fill';
    }
  } else {
    creep.moveTo(creep.room.controller);
    results = creep.claimController(creep.room.controller);
    if(results != OK) {
      if(results == ERR_GCL_NOT_ENOUGH){
        results = creep.reserveController(creep.room.controller);
        lca(creep,'call to reserveController returned: ' + displayErr(results));
      } else {
        lca(creep,'call to claimController returned: ' + displayErr(results));
      }
    } else {
      creep.memory.mode = 'build';
      if(creep.carry.energy > 0){
        creep.memory.state = 'build';
      } else if(creep.carryCapacity > 0){
        creep.memory.state = 'fill';
      }
    }
  }
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
