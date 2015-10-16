function explore(creep) {
  var results = null;
  var target = null;

  if(creep.spawning) {
    lca(creep, 'is still spawning.');
    return OK;
  }

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
      results = moveToDestinationRoom(creep, creep.memory.roomDestination);
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