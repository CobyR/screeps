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

function spawnBuilder(spawn, room, current, max){
  spawnCreep(spawn, room, current, max, BUILDER, 'builder', 'builderCounter');
}

function buildThings(creep, builder_index) {
  var t = null;

    if(creep.spawning === true) {
      lca(creep, 'is still spawning.');
      return ERR_BUSY;
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
      if(creep.room.storage){
        t = creep.room.storage;
      } else {
        t = findNearestEnergy(creep);
      }
      if(t){
        lca(creep, 'is getting energy from '+ t.structureType + ' at ' + t.pos.x + ',' + t.pos.y +'.');
        creep.moveTo(t);
        t.transferEnergy(creep);
      } else if(ALLOW_SPAWN_USE === true || creep.room.controller.level < 4) {
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
                    t =  findNearestConstructionSite(creep);
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
    if(_.includes(dnrIds, target.id)){
      // log( 'skipping ' + target.id + ' at ' + target.pos.x + ',' + target.pos.y + ' it is in a Do Not Repair zone.',true);
    } else {
      index ++;
      var targetRatio = calcRatio(target);

      // 1. structure with lowest hits and not at maxHits
      //    a. low health being equal go to one with smallest ticksToDecary
      // 2.
      //console.log( targetRatio + ' vs ' + lowestHitsRatio + '|' + target.hits + ' of ' + target.hitsMax);
      if(targetRatio < lowestHitsRatio && target.hits < target.hitsMax) {
        preferredTarget = target;
        lowestHits = target.hits;
        lowestHitsRatio = targetRatio;
        lca(creep, index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is now the preferredTarget',true);
      } else {
        if(target.structureType == 'constructedWall' && target.ticksToLive > 0){
          lca(creep, 'reviewing a constructedWall that is a newbie protective barrier, and passing on it.  TicksToLive: ' + target.ticksToLive, true);
        } else {
          lca(creep, '[DEBUG] ' + index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is being passed over', true);
        }
      }
    }
  }

  // Consider current target vs preferredTarget
  if(typeof creep.memory.currentTarget === 'undefined' ||
     creep.memory.currentTarget === null) {
    // Creep had no currentTarget - set it.
    lca(creep, 'has a new preferredTarget:' + preferredTarget.id + ' is a ' + preferredTarget.structureType + '.');
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
