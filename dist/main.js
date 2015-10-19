'use strict';

var isSimulation = (Game.rooms.sim !== undefined);
var p_room = null;

if(isSimulation){
  p_room = Game.rooms.sim;
} else {
  p_room = Game.rooms.W19S29;
}

var USE_STORAGE_THRESHOLD = 10000;


module.exports.loop = function () {

  console.log('===== Tick =====');

  stayAlive(Game.spawns.Spawn1, Game.rooms.W19S29);

  var explorers = [];
  var builders = [];
  var workers = [];
  var guards = [];
  var hoarders = [];
  var sweepers = [];

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];

    if(creep.age < 25) {
      lca(creep, 'is about to die in ' + creep.age + ' ticks.');
    }

    switch(creep.memory.role) {
    case 'guard':
      guards.push(creep.id);
      break;
    case 'harvester':
      workers.push(creep.id);
      break;
    case 'upgrade':
      workers.push(creep.id);
      break;
    case 'builder':
      builders.push(creep.id);
      break;
    case 'explorer':
      explorers.push(creep.id);
      break;
    case 'hoarder':
      hoarders.push(creep.id);
      break;
    case 'sweeper':
      sweepers.push(creep.id);
      break;
    default:
      lca(creep, 'does not have a programmed role.');
      break;
    }
  }

  processGuards(guards, p_room);
  processWorkers(workers, p_room);
  processBuilders(builders, p_room);
  processHoarders(hoarders, p_room);
  processExplorers(explorers, p_room);
  processSweepers(sweepers, p_room);

  // REPORTINGS

  storageReport(p_room);
  console.log(' Energy: ' + nwc(p_room.energyAvailable) + ' of ' + nwc(p_room.energyCapacityAvailable) + ' totalEnergy calculated: ' + nwc(totalEnergy()));
  var rptController = p_room.controller;


  if(structureReports()){
    console.log('Room Control Report - Level: ' + rptController.level + ' Progress: ' + nwc(rptController.progress) + '/' + nwc(rptController.progressTotal));
    structureReport(p_room, STRUCTURE_RAMPART);
    structureReport(p_room, STRUCTURE_ROAD);
    structureReport(p_room, STRUCTURE_WALL);
  }

  console.log('Global Control Report - Level: ' + Game.gcl.level + ' - ' + nwc(Game.gcl.progress) + ' of ' + nwc(Game.gcl.progressTotal) + '.');

  if(Game.time % 1000 === 0){
    var noticeMessage = '';

    for(var i in Memory.creeps) {
      if(!Game.spawns.Spawn1.spawning && !Game.creeps[i]) {
        var message = '[MAINTENANCE] deleting memory for ' + i;
        console.log(message );
        noticeMessage += message + '\n';
        delete Memory.creeps[i];
      }
    }
    if(noticeMessage.length > 0) {
      Game.notify(noticeMessage);
    }
  }

  if(Game.rooms.W18S29){
    stayAlive(Game.spawns.Spawn2, Game.rooms.W18S29);
  }

  console.log('all scripts completed ' + nwc(Game.time));
}


function helloWorld() {
  console.log('HELLO WORLD!');
}

function creepReports(){
    return p_room.find(FIND_FLAGS, { filter: { name: 'CR'}}).length;
}

function structureReports(){
    return p_room.find(FIND_FLAGS, { filter: {name: 'SR'}}).length;
}
function buildThings(creep, builder_index) {
  var ALLOW_SPAWN_USE = true;

    if(creep.spawning === true) {
      lca(creep, 'is still spawning.');
      return 0;
    }

    var usefulExtensions = getExtensionsWithEnergy(creep);
    var extension = null;
  var spawn = creep.room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_SPAWN}})[0];

  if(typeof spawn === 'undefined'){
    lca(creep, 'no spawn available in this room.');
    return OK;
  }

    if(creep.carry.energy === 0 || (creep.memory.state == 'filling' && creep.carry.energy != creep.carryCapacity)) {
      creep.memory.state = 'filling';
      if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy >= USE_STORAGE_THRESHOLD) {
        lca( creep, 'is getting energy from storage.');
        creep.moveTo(creep.room.storage);
        creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
      } else if(usefulExtensions.length > 0) {
        for(var id in usefulExtensions){
          extension = usefulExtensions[id];

          if(extension.energy == extension.energyCapacity){
            lca(creep, 'is getting energy from an extension.');
            creep.moveTo(extension);
            extension.transferEnergy(creep);
            break;
          }
        }
      } else if(ALLOW_SPAWN_USE === true) {
        lca( creep, 'is getting energy from spawn.');
        creep.moveTo(spawn);
        spawn.transferEnergy(creep);
      } else {
        lca(creep, 'waiting for energy in extensions or storage.');
      }
    }
    else {
        if(creep.carry.energy === 0) {
          lca( creep, 'is traveling to spawn for energy.');
          creep.moveTo(spawn);
        }
        else {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(targets.length === 0) {
              // lca(creep, 'calling fixPrioritizedStructure', true);
              creep.memory.state = 'repairing';
              fixPrioritizedStructure(creep);
            }
            else {
                // console.log('[DEBUG] Construction sites: ' + targets.length);
                if(targets.length > 0) {
                  // If creep is repairing and is mid energy and target ratio is under 65% then keep repairing
                  if(creep.memory.state == 'repairing' && creep.carry.energy != creep.carryCapacity && calcRatio(creep.memory.currentTarget) <= 0.65){
                    lca(creep,'but I am in repairing mode, and am going to stay that way until I run out of energy ' + pct(calcRatio(creep.memory.currentTarget)) + '.');
                    fixPrioritizedStructure(creep);
                  } else {
                    var t = targets[builder_index];
                    creep.memory.state = 'constructing';
                    if(t){
                      lca(creep, 'found a ' + t.structureType + ' to construct at ' + t.pos.x + ',' + t.pos.y + '.');
                      creep.moveTo(t);
                      pickupEnergy(creep);
                      creep.build(t);
                      creep.memory.currentTarget = null; // this causes them to forget what they were working on before
                    } else {
                      // This gets hit when there are more builders than construction sites to work on.
                      creep.memory.state = 'repairing';
                      fixPrioritizedStructure(creep);
                    }
                  }

                } else {
                  lca(creep, 'needs a construction site.');
                }
            }
        }
    }
}

function calcRatio(target){
  var RAMPART_HITS = 500000;
  var WALL_HITS = 1000000;
  var ratio = 0;

  if(target === null){
    return 1;
  }

  switch(target.structureType) {
  case 'rampart':
    ratio = target.hits / RAMPART_HITS;
    break;
  case 'constructedWall':
    ratio = target.hits / WALL_HITS;
    break;
  default:
    ratio = target.hits / target.hitsMax;
    break;
  }

  return ratio;
}
function displayErr(results) {
  switch(results) {
  case 7:
    return 'LEFT';
  case 3:
    return 'RIGHT';
  case 4:
    return 'BOTTOM_RIGHT';
  case 5:
    return 'BOTTOM';
  case 6:
    return 'BOTTOM_LEFT';
  case 8:
    return 'TOP_LEFT';
  case 2:
    return 'TOP_RIGHT';
  case 1:
    return 'TOP';
  case 0:
    return 'OK';
  case -1:
    return 'ERR_NOT_OWNER';
  case -2:
    return 'ERR_NO_PATH';
  case -4:
    return 'ERR_BUSY';
  case -6:
    return 'ERR_NOT_ENOUGH_ENERGY';
  case -7:
    return 'ERR_INVALID_TARGET';
  case -8:
    return 'ERR_FULL';
  case -9:
    return 'ERR_NOT_IN_RANGE';
  case -11:
    return 'ERR_TIRED';
  case -12:
    return 'ERR_NO_BODYPART';
  case -15:
    return 'ERR_GCL_NOT_ENOUGH';
  default:
    return results;
  }
}
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

function fixPrioritizedStructure(creep) {
  var GAP_BEFORE_CHANGING_TARGET = 0.03; // aka 3 %

  var MIN_HITS = 1000;

  var targets = creep.room.find(FIND_STRUCTURES);
  var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

  // console.log('gps found ' + targets.length + ' structures to consider.');

  var preferredTarget = null;
  var lowestHits = 100000000000;
  var lowestHitsRatio = 100;

  // Determine preferredTarget from all Structures & construction sites
  var index = 0;

  for(var name in targets) {
    index ++;
    var target = targets[name];
    var targetRatio = calcRatio(target);

    // 1. structure with lowest hits and not at maxHits
    //    a. low health being equal go to one with smallest ticksToDecary
    // 2.
    //console.log( targetRatio + ' vs ' + lowestHitsRatio + '|' + target.hits + ' of ' + target.hitsMax);
    if(targetRatio < lowestHitsRatio && target.hits < target.hitsMax) {
      preferredTarget = target;
      lowestHits = target.hits;
      lowestHitsRatio = targetRatio;
      // lca(creep, index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is now the preferredTarget',true);
    } else {
      if(target.structureType == 'constructedWall' && target.ticksToLive > 0){
        // lca(creep, 'reviewing a constructedWall that is a newbie protective barrier, and passing on it.  TicksToLive: ' + target.ticksToLive, true);
      } else {
        //lca(creep, '[DEBUG] ' + index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is being passed over');
      }
    }
  }

  // Consider current target vs preferredTarget
  if(typeof creep.memory.currentTarget === 'undefined' ||
     creep.memory.currentTarget === null) {
    // Creep had no currentTarget - set it.
    // lca(creep, 'has a new preferredTarget:' + preferredTarget.id + ' is a ' + preferredTarget.structureType + '.');
    creep.memory.currentTarget = preferredTarget;
  } else {
    // Creep has target - decide if it should switch to preferredTarget
    // Calculate Ratios
    var ct = Game.getObjectById(creep.memory.currentTarget.id);

    var ctHitsRatio = calcRatio(ct);
    var ptHitsRatio = calcRatio(preferredTarget);

    // console.log ('[DEBUG] currentTarget Ratio: ' + ctHitsRatio + ' preferredTarget Ratio: ' + ptHitsRatio)
    // Switch from currentTarget to preferredTarget if the folowing conditions are met:
    if(ct.structureType == 'road' && ct.hits < ct.hitsMax){
      lca(creep,'road repair from: ' + nwc(ct.hits) + ' to a maxHits of: ' + nwc(ct.hitsMax) + ' at '+ ct.pos.x + ',' + ct.pos.y + ' ratio: ' + (calcRatio(ct) * 100).toFixed(2) + '%.');
    } else {
      // 1. first  clause is that pt ratio is lower than ct - GAP
      // 2. second clause is that ct has at least MIN_HITS
      // 3. third  clause is that pt has less than MIN_HITS
      if(ptHitsRatio < (ctHitsRatio - GAP_BEFORE_CHANGING_TARGET) ||
         ctHitsRatio >= MIN_HITS ||
         (preferredTarget.hits <= MIN_HITS && ct.hits >= MIN_HITS) ||
         ctHitsRatio == 1) {
         if(ct === null){
           lca(creep, 'changing focus to ' + preferredTarget.structureType + ' with Ratio of ' + ptHitsRatio);
         } else {
           lca(creep, 'changing from focusing on ' + ct.structureType + ' with Ratio of ' + ctHitsRatio + ' to ' + preferredTarget.structureType + ' with Ratio of ' + ptHitsRatio);
         }
      creep.memory.currentTarget = preferredTarget;
      }
    }
  }

  if(typeof creep.memory.currentTarget ===  'undefined' || creep.memory.currentTarget === null){
    lca(creep, 'doesn\'t have a current target.');
  } else {
    var t = Game.getObjectById(creep.memory.currentTarget.id);

    // console.log('getObjectByID for ' + creep.memory.currentTarget.id + ' returned ' + t)

    if(t) {
      if(t.structureType != 'road') {
        lca(creep,
          t.structureType + ' at ' +
          t.pos.x + ',' + t.pos.y + ' has ' +
          nwc(t.hits) + ' of ' +
          nwc(t.hitsMax) + ' hit ratio of: ' +
          (calcRatio(t) * 100).toFixed(2) + '%');
      }
      // Take Action
      // Move
      var results = creep.moveTo(t);
      if(results != OK) {
        // lca(creep, 'call to MoveTo returned: ' + displayErr(results));
      }
      // attempt repair target
      results = creep.repair(t);
      if(results != OK && results != ERR_NOT_IN_RANGE) { lca(creep, 'call to repair returned: ' + displayErr(results)); }
    } else {
      lca(creep, 'has a currentTarget that is ' + t);
    }
  }
}

function harvest(creep, source) {
  var busy = 0;
  var STORAGE_LIMIT = 200000;

  var spawn = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN}})[0];


  if(creep.spawning === true) {
    lca(creep, 'is still spawning.');
    return 0;
  }
  var drops = creep.room.find(FIND_DROPPED_ENERGY);
  var targets = null;

  if(drops > 0){
    lca(creep,'dropped energies available: ' + drops.length);
  }

  if(creep.carry.energy === 0 || (creep.memory.state == 'gathering' && creep.carry.energy < creep.carryCapacity)) {
    lca(creep, 'is gathering energy: ' + creep.carry.energy + ' of ' + creep.carryCapacity + ' from Source at ' + source.pos.x + ',' + source.pos.y + ' ' + source.pos.roomName + '.');
    creep.moveTo(source);
    if(drops.length > 0) {
      pickupEnergy(creep,drops);
    }
    creep.harvest(source);
    creep.memory.state = 'gathering';
  } else {
    creep.memory.state = 'transferring';
    if(spawn.energy == spawn.energyCapacity) {
      // lca(creep, 'observed that the spawn energy level is at capacity.', true);
      // lca(creep, 'has ' + creep.carry.energy + ' energy.',true);
      if(creep.carry.energy > 0) {
        targets = creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}});
        //console.log(creep.name + ' says there are ' + targets.length + ' structures, looking for STRUCTURE_EXTENSION');
        for(var index in targets) {
          var target = targets[index];
          //console.log(creep.name + ' is evaluating ' + index + ' - structure type is: ' + target.structureType);
          if(busy === 0) {
            if(target.energy < target.energyCapacity) {
              lca(creep, 'is taking energy to a (' + target.structureType + ' - ' + target.pos.x +',' + target.pos.y + ' it is at ' + target.energy + ' of ' + target.energyCapacity + ').');
              creep.moveTo(target);
              creep.transferEnergy(target);
              busy = 1;
            }
          } else if(target.structureType == STRUCTURE_STORAGE && busy === 0) {
            if(target.energy < STORAGE_LIMIT) {
              lca(creep, 'is taking energy to storage (' + target.energy + ' of ' + STORAGE_LIMIT + ' max: ' + target.energyCapacity + ').');
              creep.moveTo(creep.room.storage);
              creep.transferEnergy(creep.room.storage);
              busy = 1;
            }
          }
        }
      }
      if(busy === 0 && (typeof creep.memory.locked === 'undefined' || creep.memory.locked === false)) {
        creep.memory.role = 'upgrade';
        console.log(creep.name + ' is now in \'upgrade\' mode.');
      }
    } else {
      lca(creep, 'is taking energy to spawn: ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');
      creep.moveTo(spawn);
      creep.transferEnergy(spawn);
    }
  }
}

function hoard(creep, source_index) {

  var busy = 0;

  if(creep.spawning === true) {
    lca(creep, 'is still spawning.');
    return 0;
  }

  if(creep.carry.energy === 0 || creep.memory.state == 'gathering') {
    // if(creep.room.name == 'W11S25') {
    //  var results = moveToDest(creep,'W11S26');
    // } else {
      var sources = creep.room.find(FIND_SOURCES);
      lca(creep, 'is gathering energy ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');
      creep.moveTo(sources[source_index]);
      creep.harvest(sources[source_index]);
      if(creep.carry.energy == creep.carryCapacity) {
        creep.memory.state = 'transferring';
      } else {
        creep.memory.state = 'gathering';
      }
    // }
  } else {
    if(creep.room.name == p_room.name){
      var target = creep.room.storage;
      lca(creep, 'is taking energy (' + creep.carry.energy + ') to storage (' + nwc(target.store.energy) + ' of ' + nwc(target.storeCapacity) + ').');
      creep.moveTo(creep.room.storage);
      creep.transferEnergy(creep.room.storage);
    } else {
      moveToDestinationRoom(creep, p_room.name);
    }
  }
}

function hoardRCL(creep) {

  if(creep.spawning) {
    lca(creep, 'is still spawning.');
    return 0;
  }


  if(creep.memory.state == 'fill' || creep.carry.energy === 0) {
    creep.moveTo(creep.room.storage);
    creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    lca(creep, 'getting ' + creep.carryCapacity - creep.carry.energy + ' from storage.');
  } else {
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
    lca(creep, 'upgrading controller, ' + creep.carry.energy + ' energy until empty.');
  }
}
function log(message, classification){
  switch(classification){
  case 'creep':
    if(creepReports()){
      console.log(message);
    }
    break;
  default:
    console.log(message);
  }
}

function lca(creep, message, debug) {
     if(creepReports() && debug) {
        console.log('  [DEBUG] ' + creep.name + '|' + creep.memory.role + ' ' + message);
     } else if(creepReports()) {
        console.log('  ' + creep.name + '|' + creep.memory.role + ' (' + creep.memory.state + '|' + creep.ticksToLive + '|' + creep.room.name + ') ' + message);
     }
}
function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function moveToDestinationRoom(creep, destRoomName) {
  var dRoom = null;
  var cRoom = creep.room;
  var evalX = -1;
  var evalY = -1;

  var exitDir = cRoom.findExitTo(destRoomName || creep.memory.roomDestination);

  var results = OK;

  if(typeof creep.memory.wait == 'undefined' || creep.room.name != creep.memory.roomBeforeThat){
    creep.memory.wait = 0;
  }
  if(creep.room.name != creep.memory.previousRoom) {
    lca(creep,'I changed rooms ------------------------->' + creep.room.name,true);
    if(creep.memory.wait == 2){
      results = creep.moveTo(25, 25);
    } else {
      lca(creep, 'incrementing wait by 1 from' + creep.memory.wait, true);
      creep.memory.wait ++;
    }

    lca(creep, 'trying to move in the new room yielded: ' + displayErr(results), true);
    creep.memory.roomBeforeThat = creep.memory.previousRoom;
    creep.memory.previousRoom = creep.room.name;
    return OK;
  }

  switch(exitDir) {
  case TOP:
    //lca(creep, 'exit is to the top, evaluating the options');
    evalY = 0;
    break;

  case RIGHT:
    //lca(creep, 'exit is to the right, evaluating the options');
    evalX = 49;
    break;

  case BOTTOM:
    //lca(creep, 'exit is to the bottom, evaluating the options');
    evalY = 49;
    break;

  case LEFT:
    //lca(creep,'exit is to the left, evaluating the options');
    evalX = 0;
    break;

  default:
    if(creep.room.name == creep.memory.roomDestination){
      lca(creep, 'destination reached, executing the secret mission!');
      results = roomSecretMission(creep);
    }
    lca(creep, 'an exit to reach ' + destRoomName + ' doesn\'t exist');
    return OK;
  }

  // evalute movement
  var x = 0;
  var y = 0;
  var shortestDistance = 50;
  var closestExitPos = null;
  var exitPosition = null;

  for (var i = 0; i < 50; i++) {
    if(evalX == -1){
      x = i;
      y = evalY;
    } else {
      x = evalX;
      y = i;
    }
    var things = creep.room.lookAt(x,y);

    if(things[0].terrain == 'plain'){
      exitPosition = creep.room.getPositionAt(x, y);
      //console.log(exitPosition);
      var distance = creep.pos.getRangeTo(exitPosition);
      if(distance < shortestDistance){
        shortestDistance = distance;
        closestExitPos = exitPosition;
        lca(creep, x +  ',' + y + ' : ' + things[0].terrain + ' distance = ' + distance,true);
      }
    }
  }
  results = creep.moveTo(exitPosition);
  if(results != OK || results != ERR_TIRED){
    if(results == ERR_NO_PATH){
      lca(creep,'trying the destructible route');
      results = creep.moveTo(exitPosition,{ ignoreDestructibleStructures: true });
      lca(creep, 'destruction path resulted in: ' + displayErr(results) + ' to ' +
         exitPosition.x + ',' + exitPosition.y + ' in room: ' + exitPosition.roomName);
    } else {
      lca(creep, 'movement resulted in: ' + displayErr(results));
    }

  }
  creep.memory.previousRoom = cRoom.name;
}

function nwc(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
function pct(value) {
  return (value * 100).toFixed(2) + '%';
}
function pickupEnergy(creep, drops) {
  if(drops === null) {
    drops = creep.room.find(FIND_DROPPED_ENERGY);
  }

  for(var index in drops) {
    var drop = drops[index];

    var results = creep.pickup(drop);
    lca(creep, 'tried to pickup dropped energy: ' + displayErr(results));
  }
}
function processBuilders(builders) {

  if(builders.length > 0) {
    log('[Builders] -------------------','creep');

    var previousCreepsTargetId = null;
    var index = -1;

    for(var id in builders) {
      index++;
      var creep = Game.getObjectById(builders[id]);
      if(creep.spawning) {
        lca(creep, 'is still spawning.');
        continue;
      }

      if(typeof creep.memory.currentTarget === 'undefined') {
        creep.memory.currentTarget = null;
      }
      if(creep.memory.currentTarget === null || creep.memory.currentTarget.id == previousCreepsTargetId) {
        // lca(creep, 'current target is being cleared, someone is on it already', true)
        creep.memory.currentTarget = null;
      } else {
        // lca(creep, 'current target is being set as previous',true)
        previousCreepsTargetId = creep.memory.currentTarget.id;
      }

      buildThings(creep, index);
   }
  }
}
function processExplorers(explorers, report) {
  if(explorers.length > 0) {
    log('[Explorers] ------------------','creep');
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
        lca(creep, 'setting common destination', report, true);
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
        lca(creep, 'evaluating for goal success', report);

        if(creep.pos.x == commonDestination.x && creep.pos.y == commonDestination.y) {
          lca(creep, '   goal == true', report);
          goal = true;
        } else {
          lca(creep, ' goal == false - ' + commonDestination.x + ',' + commonDestination.y, report);
        }
      }

      if(goal) {
        assignNextPosition(cdCreeps);
      }
    } else {
      console.log('another unexepected code branch in processExplorers');
    }

    // let all position based creeps do their thing
    for(id in poss) {
      creep = Game.getObjectById(poss[id]);

      explore(creep);
    }
  }
}
function processGuards(guards) {
  if(guards.length > 0) {
    log('[Guards] -------------------','creep');

    for(var id in guards) {
      var creep = Game.getObjectById(guards[id]);
      protect(creep);
    }
  }
}
function processHoarders(hoarders) {
  var HOARD_REMOTE = false;

  if(hoarders.length > 0){
    log('[Hoarders] --------------','creep');
    var i = 0;
    for(var id in hoarders) {
      var creep = Game.getObjectById(hoarders[id]);
      i++;
      // console.log( i + " " + i % 2);
      if(creep.room.name == p_room.name && i % 2 === 0 && creep.room.storage.store.energy > 100000 + creep.carryCapacity && HOARD_REMOTE === true) {
         hoardRCL(creep);
       } else {
         hoard(creep, i % 2);
      }
    }
  }
}

function processWorkers(workers, p_room) {
  var index = 0;

  log('[Workers] -------------------','creep');

  var sources = null;
  var source = null;

  for(var id in workers) {
    var creep = Game.getObjectById(workers[id]);
    index ++;

    // lca(creep, creep.room.name + ' vs ' + p_room.name, true );
    if(creep.room.name == p_room.name){
      sources = p_room.find(FIND_SOURCES);

      // lca(creep, 'is in primary room it has ' + sources.length + ' source(s).' ,true);
      if(sources.length > 1){
        if(index % 2){
          source = sources[0];
        } else {
          source = sources[1];
        }
      } else {
        source = sources[0];
      }
    } else {
      sources = creep.room.find(FIND_SOURCES);
      if(sources.length == 1){
        source = sources[0];
      } else {
        lca(creep, 'no source ?');
        return OK;
      }
    }

    switch(creep.memory.role) {
    case 'harvester':
      harvest(creep, source);
      break;
    case 'upgrade':
      upgrade(creep, source);
      break;
    }
  }
}
function protect(creep) {
  if(creep.spawning === true) {
    lca(creep, 'is still spawning.');
    return 0;
  }

  var targets = creep.room.find(FIND_HOSTILE_CREEPS);
  var dest = null;
  var results = OK;

  if(targets.length) {
    // There are hostiles, run without concern and attack them.
    lca(creep, ' has found ' + targets.length + ' hostiles.');
    creep.moveTo(targets[0]);
    creep.attack(targets[0]);
  } else {
    // There are no hostiles, move to a flag.
    if(typeof creep.memory.destination === 'undefined' ||
       creep.memory.destination === null) {
      targets = creep.room.find(FIND_FLAGS, { filter: { color: COLOR_RED}});
      //lca(creep,'found ' + targets.length + ' flags', true);
      for(var id in targets) {
        var target = targets[id];

        // lca(creep, id + ':' + target.name , true);

        var t = target;

        // lca(creep, t.color + ' flag at ' + t.pos.x + ' x ' + t.pos.y + ' manned by ' + t.memory.manned + '.',true);

        // Check to see if flag is occupied
        if(typeof target.memory.manned === 'undefined' ||
           target.memory.manned === null) {
          creep.memory.destination = target;
          target.memory.manned = creep;
          creep.memory.state = 'traveling';
          lca(creep, 'is assigned to ' + creep.memory.destination.name + ' which is manned by ' + target.memory.manned.name, true);
          break;  // break the for loop so the guard doesn't get assigned to multiple flags
        } else {
          // house cleaning - make sure creep is alive, if not clear manned position
          var checkCreep = Game.getObjectById(target.memory.manned.id);
          // lca(creep,'check creep returned:' + checkCreep + ' for ' + target.name,true);
          if(checkCreep === null) {
            console.log('[DEBUG] the creep guarding ' + target.name + ' is gone...');
            target.memory.manned = null;
          } else {
            var checkFlag = Game.getObjectById(checkCreep.memory.destination.id);

            if(checkFlag === null) {
              console.log('[DEBUG] the target ' + checkCreep.memory.destination.name + 'does not exist, clearing memory.');
              checkCreep.memory.destination = null;
            }
          }
        }
      }
      if(typeof creep.memory.destination === 'undefined' ||
         creep.memory.destination === null) {
        creep.memory.state = 'roaming';
        lca(creep, 'does not have a specific destination.');
      }

    } else {
      // assignment is set
      if(creep.memory.state == 'traveling') {
        lca(creep, 'is traveling to flag: ' + creep.memory.destination.name + ' - ' + creep.memory.destination.id);
        dest = Game.getObjectById(creep.memory.destination.id);

        results = creep.moveTo(dest);
        if(results != OK && results != ERR_TIRED) {
          lca(creep, 'when told to move the results where ' + displayErr(results));
        }

        // check to see if creep is at destination if so, switch to guarding
        if(creep.pos.x == dest.pos.x && creep.pos.y == dest.pos.y) {
          lca(creep, 'is at specified destination', true);
          creep.memory.state = 'guarding';
        }
      }

      // handle action for guarding state
      if (creep.memory.state == 'guarding'){
        // do something while guarding.
        dest = Game.getObjectById(creep.memory.destination.id);
        if(dest !== null) {
          var gf = dest.memory.guard_from || dest.pos;

          if(gf) {
            // guard_from is set on the flag
            if(creep.pos.x == gf.x && creep.pos.y == gf.y) {
              // do nothing in the correct location
              // lca(creep,'is in the right guard from location',true);
            } else {
              lca(creep,'needs to move to guard from location',true);
              results = creep.moveTo(gf.x, gf.y);
              // lca(creep, 'err while moving to gf spot: ' + displayErr(results), true);
            }
          }
          lca(creep, 'waiting for Hostiles at ' + creep.memory.destination.name +'.');
        } else {
          lca(creep, 'flag guard was guarding is gone...');
          creep.memory.destination = null;
        }
      }
    }
  }
}
// used by explorer's is executed when room destination is reached.

function roomSecretMission(creep) {

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
    }
    break;
  default:
    creep.memory.mode = 'pillage';
    creep.memory.state = 'destroying';
  }
}
/*
 * Stayalive - code to keep breeding creeps
 */
function stayAlive(spawn, room) {

  var workers = 0;
  var harvesters = 0;
  var upgraders = 0;
  var guards = 0;
  var builders = 0;
  var warriors = 0;
  var healers = 0;
  var explorers = 0;
  var hoarders = 0;

  var MAX_WORKERS = room.find(FIND_FLAGS, { filter: {color: COLOR_YELLOW}}).length;
  var MAX_GUARDS = room.find(FIND_FLAGS, { filter: {color: COLOR_RED}}).length;
  var MAX_BUILDERS = room.find(FIND_FLAGS, { filter: { color: COLOR_BROWN}}).length;
  var MAX_WARRIORS = 0;
  var MAX_HEALERS = 0;
  var MAX_EXPLORERS = 0;
  var MAX_HOARDERS = room.find(FIND_FLAGS, { filter: {color: COLOR_PURPLE}}).length;

  var explorerDestination = 'W18S29';
  var results = OK;

  if(typeof room.memory.worker_counter === 'undefined') {
    room.memory.worker_counter = 0;
    room.memory.builder_counter = 0;
    room.memory.guard_counter = 0;
    room.memory.warrior_counter = 0;
    room.memory.healer_counter = 0;
    room.memory.explorer_counter = 0;
    room.memory.hoarder_counter = 0;
    room.memory.sweeper_counter = 0;
  }

  // count creeps
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.room.name == room.name){
      if(creep.memory.role == 'harvester') {
        harvesters +=1;
        workers += 1;
      } else if(creep.memory.role == 'upgrade') {
        upgraders += 1;
        workers += 1 ;
      } else if(creep.memory.role == 'guard') {
        guards += 1;
      } else if(creep.memory.role == 'builder') {
        builders += 1;
      } else if(creep.memory.role == 'explorer') {
        explorers += 1;
      } else if(creep.memory.role == 'hoarder') {
        hoarders += 1;
      }
    }
  }

  // calculate MAX #'s
  if(workers < 4 ) {
    MAX_WORKERS = 4;
    MAX_BUILDERS = 0;
  } else if (workers == 4 ) {
    MAX_WORKERS = 6;
    MAX_BUILDERS = 1;
  }

  if (workers >=8 && guards >= 4 && builders >= 2) {
    MAX_EXPLORERS=room.find(FIND_FLAGS, { filter: {color: COLOR_ORANGE}}).length;
  }

  // report stats
  console.log('CREEPS: ' +
              workers + ' of ' + MAX_WORKERS +  ' workers h:' + harvesters + '/ u:' + upgraders + ', ' +
              guards + ' of ' + MAX_GUARDS + ' guards, ' +
              builders + ' of ' + MAX_BUILDERS + ' builders, ' +
              explorers + ' of ' + MAX_EXPLORERS + ' explorers, and ' +
              hoarders + ' of ' + MAX_HOARDERS + ' hoarders.');

  // spawn guards
  if(guards < MAX_GUARDS && workers >= MAX_WORKERS / 2 ) {
    if(room.energyAvailable >= 270){
      results = OK;
      // spawn standard guard

      console.log('Spawning a new tough guard.');
      results = spawn.createCreep([TOUGH,MOVE,
                                                TOUGH,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE,
                                                ATTACK,MOVE], 'G' + room.memory.guard_counter, { role: 'guard'});
      if(results != OK ){
        console.log('Spawning a new guard, tough guard said ' + displayErr(results) + '.');
        results = spawn.createCreep([TOUGH,ATTACK,ATTACK,MOVE,MOVE], 'g' + room.memory.guard_counter, { role: 'guard'});
      }

      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.guard_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a guard - energy levels at ' + room.energyAvailable + ' of required 270.');
    }
  }


  // spawn workers
  if(workers < MAX_WORKERS && (guards >= MAX_GUARDS || workers < 5)) {
    if(room.energyAvailable >= 250) {
      results = OK;
      console.log('Spawning a new mega worker.');
      results = spawn.createCreep( [MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK], 'W' + room.memory.worker_counter, { role: 'harvester', locked: false});
      console.log('system says: ' + displayErr(results));
      if(results == ERR_NOT_ENOUGH_ENERGY){
        console.log('Spawning a new worker - mega worker said: ' + displayErr(results) +'.');
        results = spawn.createCreep( [MOVE, CARRY, CARRY,WORK], 'w' + room.memory.worker_counter, { role: 'harvester', locked: false});
      }
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.worker_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a worker - energy levels at ' + spawn.energy + ' of required 250.');
    }
  }

  // spawn hoarders
  if( hoarders < MAX_HOARDERS && workers >= MAX_WORKERS  && room.controller.level >= 4) {
    if(room.energyAvailable >= 550) {
      results = spawn.createCreep( [MOVE,MOVE,
                                                 CARRY,CARRY,
                                                 CARRY,CARRY,
                                                 CARRY,WORK,
                                                 WORK,WORK,
                                                 WORK], 'H' + room.memory.hoarder_counter, { role: 'hoarder', locked: true});
      console.log('Spawning a new hoarder - ' + displayErr(results) +'.');
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.hoarder_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a hoarder - energy levels at ' + spawn.energy + ' of required 550.');
    }
  }


  // spawn builders
  if(builders < MAX_BUILDERS && workers >= MAX_WORKERS && guards >= MAX_GUARDS) {
    if(room.energyAvailable >= 300){
      results = OK;
      console.log('Spawning a new mega builder.');
      results = spawn.createCreep([WORK, WORK,
                                                CARRY, CARRY,
                                                CARRY, CARRY,
                                                CARRY, CARRY,
                                                MOVE, MOVE,
                                                MOVE, MOVE,
                                                MOVE, MOVE], 'B' + room.memory.builder_counter, { role: 'builder', state: 'constructing'});
      if(results == ERR_NOT_ENOUGH_ENERGY) {
        log('Spawning a new builder, mega builder said: ' + displayErr(results), 'spawn');
          results = spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'b' + room.memory.builder_counter, {role: 'builder', state: 'constructing'});
      }
      if(results == OK || results == ERR_NAME_EXISTS) {
        room.memory.builder_counter += 1;
      }
    } else {
      console.log('I wanted to spawn a builder - energy levels at ' + room.energyAvailable + ' of required 300.');
    }
  }


  // spawn explorers
  if(typeof spawn.memory.explorersEnabled === 'undefined' || spawn.memory.explorersEnabled === false ) {
    // not launching any explorers
  } else {
    if(explorers < MAX_EXPLORERS  && workers >= MAX_WORKERS && guards >= MAX_GUARDS && builders >= MAX_BUILDERS) {
      if(room.energyAvailable >= 550) {
        var explorerName = 'E' + room.memory.explorer_counter;
        console.log('Spawning a new explorer - ' + explorerName + '.');

        results = spawn.createCreep([TOUGH,MOVE,
                                                  TOUGH,MOVE,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK,
                                                  MOVE,CARRY,
                                                  MOVE,WORK],
                explorerName, { role: 'explorer', mode: 'room', roomDestination: explorerDestination});
        if(results == OK || results == ERR_NAME_EXISTS) {
          room.memory.explorer_counter += 1;
        } else {
          console.log('trying to create an explorer resulted in ' + displayErr(results));
        }
      } else {
        console.log('I wanted to spawn an explorer - energy levels at ' + spawn.energy + ' of required 550');
      }
    }
  }
}
function storageReport(room) {
  var upDown = '';

  if(typeof room.storage !== 'undefined'){

    var lastRound = room.memory.lastRoundStoredEnergy;
    var diff = room.storage.store.energy - lastRound;

    if(typeof room.memory.lastRoundStoredEnergy === 'undefined'){
      room.memory.lastRoundStoredEnergy = room.storage.store.energy;
      room.memory.lastRoundTicks = Game.time;
    } else {
      room.memory.lastRoundStoredEnergy = room.storage.store.energy;
      room.memory.lastRountTicks = Game.time;
    }

    if(diff === 0){
      upDown = 'stayed the same';
    } else if(diff > 0) {
      upDown = 'gone up';
    } else {
      upDown = 'gone down';
    }
    if(diff === 0){
      console.log('Storage Report: ' + nwc(room.storage.store.energy) + ' has ' + upDown);
    } else {
    console.log('Storage Report: ' + nwc(room.storage.store.energy) + ' has ' + upDown + ' by ' + nwc(Math.abs(diff)) + ' since the benchmark was set.');
    }
  }
}
function structureReport(room, structureType){
  var structures = room.find(FIND_STRUCTURES, {
                             filter: { structureType: structureType}
                             });

  var strongest = null;
  var weakest = null;
  var totalHits = 0;
  var averageHits = 0;
  var hitsArray = [];
  var s = null;

  for(var id in structures) {
    s = structures[id];
    if(strongest === null || s.hits > strongest.hits){
      strongest = s;
    }
    if(weakest === null || s.hits < weakest.hits){
      weakest = s;
    }
    totalHits += s.hits;
    hitsArray.push(s.hits);
  }

  averageHits = totalHits / structures.length;

  var above = 0;
  var below = 0;
  for(id in structures){
    s = structures[id];
    if(s.hits > averageHits){
      above ++;
    } else {
      below ++;
    }
  }

  console.log(structures.length + ' ' + structureType + 's in this room.');
  console.log('Strongest: ' + nwc(strongest.hits) + ' and is located at ' + strongest.pos.x + ',' + strongest.pos.y + ' with a ratio of: ' + pct(calcRatio(strongest)) + '.');
  console.log('  Weakest: ' + nwc(weakest.hits) + ' and is located at ' + weakest.pos.x + ',' + weakest.pos.y + ' with a ratio of: ' + pct(calcRatio(weakest)) + '.');
  console.log('Average Hits per ' + structureType + ' is ' + nwc(averageHits) + '.');
  console.log('There are ' + above + ' above the average, and '+ below + ' below.');
  console.log('Median hits per ' + structureType + ' is ' + nwc(median(hitsArray)));
}

function sweep(creep){
  var drops = creep.room.find(FIND_DROPPED_ENERGY);

  var closestDrop = null;
  var distance = 0;
  var shortestDistance = 50;

  for(var index in drops){
    var drop = drops[index];

    distance = creep.pos.getRangeTo(drop);

    if(distance < shortestDistance) {
      shortestDistance = distance;
      closestDrop = drop;
    }
  }
  if(closestDrop === null){
    lca(creep, 'waiting for someone to drop some energy.');
  } else{
    lca(creep, 'moving to ' + closestDrop.pos.x + ',' + closestDrop.pos.y + ' to pickup ' + closestDrop.energy + ' energy.');
  creep.moveTo(closestDrop);
  creep.pickup(closestDrop);
  }

}

function processSweepers(sweepers, room){
  if(sweepers.length > 0) {
    log('[Sweepers] -----------------','creep');

    for(var id in sweepers) {
      var creep = Game.getObjectById(sweepers[id]);
      sweep(creep);
    }
  }

}
function totalEnergy() {
  var tE = 0;

  var structures = p_room.find(FIND_MY_STRUCTURES);
  var extensions = [];
  var spawns = [];

  for(var name in structures){
    var structure = structures[name];
    var ext = null;

    switch(structure.structureType) {
    case 'extension':
      // console.log('Extension: ' + structure.id + ' - ' + structure.energy);
      tE += structure.energy;
      break;
    case 'spawn':
      // console.log('Spawn: ' + structure.name + ' - ' + structure.energy);
      tE += structure.energy;
      break;
    default:
    }
  }

  return tE;
}
function upgrade(creep) {
  if(creep.spawning === true) {
    lca(creep,'is still spawning.');
    return 0;
  }

  var spawn = creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})[0];

  if(creep.memory.state == 'fill') {
    if(creep.carry.energy == creep.carryCapacity) {
      if(spawn.energy < spawn.energyCapacity && !creep.memory.locked) {
        creep.memory.role = 'harvester';
        lca(creep, 'is now in \'harvester\' mode.');
      } else {
        if(typeof creep.memory.locked === 'undefined' || creep.memory.locked === false) {
          creep.memory.state = 'upgrade';
          lca(creep, 'is now in \'upgrade\' mode.');
        } else {
          lca(creep, 'is a permanent harvester.');
        }
      }
    }
  } else {
    if(creep.carry.energy === 0) {
      creep.memory.state = 'fill';
    }
  }
  var usefulExtensions = getExtensionsWithEnergy(creep);
  var extension = null;

  if(creep.carry.energy === 0  || creep.memory.state == 'fill') {
    if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store.energy >= USE_STORAGE_THRESHOLD){
      lca(creep, 'is getting energy from storage.');
      creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    } else if(usefulExtensions.length > 0){
      for(var id in usefulExtensions){
        extension = usefulExtensions[id];

        if(extension.energy == extension.energyCapacity){
          lca(creep,'is getting energy from an extension.');
          creep.moveTo(extension);
          extension.transferEnergy(creep);
          break;
        }
      }
    } else {
      var sources = creep.room.find(FIND_SOURCES);
      lca(creep, 'is gathering energy.');
      creep.moveTo(sources[0]);
      creep.harvest(sources[0]);
      pickupEnergy(creep);
    }
  } else {
    if(spawn.energy < spawn.energyCapacity  && !creep.memory.locked) {
      lca(creep, 'spawn is low on energy changing to harvester mode.');
      creep.memory.role='harvester';
    } else {
      lca(creep, 'is upgrading controller.');
      creep.moveTo(creep.room.controller);
      pickupEnergy(creep);
      creep.upgradeController(creep.room.controller);
    }
  }
}

function getExtensionsWithEnergy(creep) {
  var extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: {
                                  structureType: STRUCTURE_EXTENSION
                                                            } });
  var usefulExtensions = [];
  var extension = null;

  for(var id in extensions){
    extension = extensions[id];
    if(extension.energy == extension.energyCapacity){
      usefulExtensions.push(extension);
    }
  }
  return usefulExtensions;
}