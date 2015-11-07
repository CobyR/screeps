var BUILDER = {
  1: [MOVE, MOVE, WORK, CARRY, CARRY],
  2: [MOVE, MOVE, MOVE,
      WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY],
  3: [MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY],
  4: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  5: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      WORK, WORK, WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
}

function processBuilders(builders) {

  if(builders.length > 0) {
    log('------------------- '+ builders.length ,'Builders');

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

function spawnBuilder(spawn, room, current, max){
  spawnCreep(spawn, room, current, max, BUILDER, 'builder');
}

function buildThings(creep, builder_index) {

  if(creep.spawning === true) {
    lca(creep, 'is still spawning.');
    return ERR_BUSY;
  }

  callForReplacement(creep);

  var site =  findNearestConstructionSite(creep);

  if(site){
    lca(creep, 'site is a ' + site.structureType + ' at ' + site.pos.x + ',' + site.pos.y + '.', true);
  } else {
    lca(creep, 'no construction sites.',true);
  }

  switch(creep.memory.state){
  case 'filling':
    if(creep.carry.energy == creep.carryCapacity) {
      if(creep.memory.overrideState){
        creep.memory.state = creep.memory.overrideState;
        break;
      }
      var emergency = findNearestEmergencyRepair(creep);

      if(site && !emergency){
        creep.memory.state = 'constructing';
        lca(creep, 'construction sites are available and nothing is in dire need of repair.');
      } else {
        creep.memory.state = 'repairing';
        creep.memory.currentTarget = emergency;
        fixPrioritizedStructure(creep);
      }
    } else {
      findEnergy(creep);
    }
    break;
  case 'road':
    var road = findNearestRoadWithMostNeed(creep);
    var currentRoad = null;

    if(creep.memory.currentRoad){
      currentRoad = Game.getObjectById(creep.memory.currentRoad.id);
    }
    if(road){
      if(currentRoad  && currentRoad.hits < currentRoad.hitsMax){
        creep.moveTo(currentRoad);
        creep.repair(currentRoad);
        lca(creep, 'repairing road at ' + currentRoad.pos.x +
            ',' + currentRoad.pos.y + ' ' +
            currentRoad.hits + ' of ' + currentRoad.hitsMax + '.');
      } else {
        creep.memory.currentRoad = road;
        lca(creep, 'moving to road at ' + road.pos.x + ',' + road.pos.y + ' ' + road.hits + ' of ' + road.hitsMax + '.');
      }
      if(creep.carry.energy === 0){
        creep.memory.state = 'filling';
        creep.memory.overrideState = 'road';
      }
    } else {
      lca(creep, 'no roads to repair, so waiting for decay.');
    }

    break;
  case 'repairing':
    var ctRatio = 0;
    var t = null;

    if(creep.memory.currentTarget && creep.memory.currentTarget.structureType == STRUCTURE_CONTROLLER){
      lca(creep, 'WTF? why am I being asked to repair a controller?  Resetting currentTarget to null.');
      creep.memory.currentTarget = null;
    }

    if(creep.carry.energy === 0){
      creep.memory.state = 'filling';
      lca(creep, 'out of energy, changing to filling.');
      break;
    }

    if(creep.memory.currentTarget){
      ctRatio = calcRatio(creep.memory.currentTarget);
      t = Game.getObjectById(creep.memory.currentTarget.id);
    }

    lca(creep, 'current target ratio: ' + ctRatio, true);

    if(site && ctRatio > 0.03){
      creep.memory.state = 'constructing';
      lca(creep, 'abandoning current repair at ' + ctRatio + ', new construction Site available.');
    } else {
      fixPrioritizedStructure(creep);
    }
    break;
  case 'constructing':
    if(creep.carry.energy === 0){
      creep.memory.state = 'filling';
      lca(creep, 'out of energy, changing to filling.');
      break;
    }

    if(site){
      lca(creep, 'found a ' + site.structureType +
        ' to construct at ' + site.pos.x + ',' + site.pos.y + '.');
      creep.moveTo(site);
      pickupEnergy(creep);
      creep.build(site);
      creep.memory.currentTarget = site;
    } else {
      /* This gets hit when there are no construction sites. */
      creep.memory.state = 'repairing';
      fixPrioritizedStructure(creep);
    }
    break;
  default:
    creep.memory.state = 'filling';
  }
}

function fixPrioritizedStructure(creep) {
  var GAP_BEFORE_CHANGING_TARGET = 0.03; // aka 3 %

  var MIN_HITS = 1000;

  var targets = creep.room.find(FIND_STRUCTURES);
  var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

  var dnrStructures  = getDNRStructures(creep.room);
  // log('dnrStructures returned: ' + dnrStructures.length);
  var dnrIds = _.map(dnrStructures, 'id');

  // console.log('gps found ' + targets.length + ' structures to consider.');

  var preferredTarget = null;
  var lowestHits = 100000000000;
  var lowestHitsRatio = 100;

  // Determine preferredTarget from all Structures & construction sites
  var index = 0;

  for(var name in targets) {
    var target = targets[name];
    if(target.structureType != STRUCTURE_CONTROLLER){
      if(_.includes(dnrIds, target.id)){
        // log( 'skipping ' + target.id + ' at ' + target.pos.x + ',' + target.pos.y + ' it is in a Do Not Repair zone.',true);
      } else {
        index ++;
        var targetRatio = calcRatio(target);

        if(targetRatio < lowestHitsRatio && target.hits < target.hitsMax) {
          preferredTarget = target;
          lowestHits = target.hits;
          lowestHitsRatio = targetRatio;
          lca(creep, index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is now the preferredTarget',true);
        } else {
          if(target.structureType == 'constructedWall' && target.ticksToLive > 0){
            lca(creep, 'reviewing a constructedWall that is a newbie protective barrier, and passing on it.  TicksToLive: ' + target.ticksToLive, true);
          } else {
            lca(creep, index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is being passed over', true);
          }
        }
      }
    } else {
      lca(creep, 'skipping this target it is a controller',true);
    }
  }

  // Consider current target vs preferredTarget
  if(!creep.memory.currentTarget) {
    // Creep had no currentTarget - set it.
    lca(creep, 'has a new preferredTarget:' + preferredTarget.id + ' is a ' + preferredTarget.structureType + '.');
    creep.memory.currentTarget = preferredTarget;
  } else {
    // Creep has target - decide if it should switch to preferredTarget
    // Calculate Ratios
    var ct = Game.getObjectById(creep.memory.currentTarget.id);

    var ctHitsRatio = calcRatio(ct);
    var ptHitsRatio = calcRatio(preferredTarget);

    if(ct && ct.structureType == 'road' && ct.hits < ct.hitsMax){
      lca(creep,'road repair from: ' + nwc(ct.hits) + ' to a maxHits of: ' + nwc(ct.hitsMax) + ' at '+ ct.pos.x + ',' + ct.pos.y + ' ratio: ' + (calcRatio(ct) * 100).toFixed(2) + '%.');
    } else {
      if(ptHitsRatio < (ctHitsRatio - GAP_BEFORE_CHANGING_TARGET) ||
         (preferredTarget.hits <= MIN_HITS && ct.hits >= MIN_HITS) ||
         ctHitsRatio == 1) {
        if(ct){
         lca(creep, 'changing from focusing on ' +
           ct.structureType + ' with Ratio of ' +
           ctHitsRatio + ' to ' + preferredTarget.structureType +
           ' with Ratio of ' + ptHitsRatio);
        } else {
          lca(creep, 'my currentTarget was invalid.');
        }

        creep.memory.currentTarget = preferredTarget;
      }
    }
  }

  var t = Game.getObjectById(creep.memory.currentTarget.id);

  if(t) {
    if(t.structureType != 'road') {
      lca(creep,
        'repairing ' +
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
    if(results != OK && results != ERR_NOT_IN_RANGE) {
      lca(creep, 'call to repair returned: ' + displayErr(results));
    }
  } else {
    lca(creep, 'has a currentTarget that is ' + t);
  }
}
