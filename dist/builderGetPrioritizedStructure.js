/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder.getPrioritizedStructure'); // -> 'a thing'
 */
module.exports = function(creep) {
  var displayError = require('displayError');
  var calcRatio = require('calculateStructureHealthRatio');
  var lca = require('logCreepAction');

  var numberWithCommas = require('numberWithCommas');
  var GAP_BEFORE_CHANGING_TARGET = 0.25; // aka 25 %

  var MIN_HITS = 1000;

  var targets = creep.room.find(FIND_STRUCTURES);
  // console.log('gps found ' + targets.length + ' structures to consider.');

  var preferredTarget = null;
  var lowestHits = 100000000000;
  var lowestHitsRatio = 100;

  // Determine preferredTarget from all Structures
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
     creep.memory.currentTarget == null) {
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
    // 1. first  clause is that pt ratio is lower than ct - GAP
    // 2. second clause is that ct has at least MIN_HITS
    // 3. third  clause is that pt has less than MIN_HITS
    if(ptHitsRatio < (ctHitsRatio - GAP_BEFORE_CHANGING_TARGET) ||
       ctHitsRatio >= MIN_HITS ||
       preferredTarget.hits <= MIN_HITS) {
      lca(creep, 'changing from focusing on ' + ct.structureType + ' with Ratio of ' + ctHitsRatio + ' to ' + preferredTarget.structureType + ' with Ratio of ' + ptHitsRatio);
      creep.memory.currentTarget = preferredTarget;
    }
  }

  if(typeof creep.memory.currentTarget ===  'undefined' || creep.memory.currentTarget == null){
    lca(creep, 'doesn\'t have a current target.');
  } else {
    var t = Game.getObjectById(creep.memory.currentTarget.id);

    // console.log('getObjectByID for ' + creep.memory.currentTarget.id + ' returned ' + t)

    if(t) {
      console.log(creep.name + '|' + creep.memory.role + ' is repairing ' +
                  t.structureType + ' at x:' +
                  t.pos.x + ' y:' + t.pos.y + ' has ' +
                  numberWithCommas(t.hits) + ' of ' +
                  numberWithCommas(t.hitsMax) + ' hit ratio of: ' +
                  (calcRatio(t) * 100).toFixed(2) + '%');
      // Take Action
      // Move
      var results = creep.moveTo(t);
      if(results != OK) { lca(creep, 'call to MoveTo returned: ' + displayError(results)); }
      // attempt repair target
      results = creep.repair(t);
      if(results != OK && results != ERR_NOT_IN_RANGE) { lca(creep, 'call to repair returned: ' + displayError(results)); }
    } else {
      lca(creep, 'has a currentTarget that is ' + t);
    }
  }
};
