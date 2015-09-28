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
     var numberWithCommas = require('numberWithCommas');
     var GAP_BEFORE_CHANGING_TARGET = 0.1 // aka 10 %

     var WALL_HEALTH = 25000;

    targets = creep.room.find(FIND_STRUCTURES);
    // onsole.log('gps found ' + targets.length + ' structures to consider.');

    var preferredTarget = null;
    var lowestHits = 100000000000;
    var lowestHitsRatio = 100;

    // Determine preferredTarget from all Structures
    var index = 0
    for(var name in targets) {
        index ++
        var target = targets[name];
        var targetRatio = calcRatio(target);

        // 1. structure with lowest hits and not at maxHits
        //    a. low health being equal go to one with smallest ticksToDecary
        // 2.
        if(targetRatio < lowestHitsRatio && target.hits < target.hitsMax) {
            preferredTarget = target;
            lowestHits = target.hits;
            lowestHitsRatio = targetRatio
            // console.log('[DEBUG] ' + index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is now the preferredTarget')
        } else {
            //console.log('[DEBUG] ' + index + ': ' + target.id + ' a ' + target.structureType + ' has ' + target.hits + ' for a ratio of ' + targetRatio + ' and is being passed over')
        }
    }

    // Consider current target vs preferredTarget
    if(typeof creep.memory.currentTarget === 'undefined' || creep.memory.currentTarget == null) {
        // Creep had no currentTarget - set it.
        creep.memory.currentTarget = preferredTarget;
    } else {
        // Creep has target - decide if it should switch to preferredTarget
        // Calculate Ratios
        var ct = Game.getObjectById(creep.memory.currentTarget.id);

        var ctHitsRatio = calcRatio(ct);
        var ptHitsRatio = calcRatio(preferredTarget);

        // console.log ('[DEBUG] currentTarget Ratio: ' + ctHitsRatio + ' preferredTarget Ratio: ' + ptHitsRatio)
        // Switch to the lower ratio wall or continue with currentTarget
        if(ptHitsRatio < (ctHitsRatio - GAP_BEFORE_CHANGING_TARGET) || ctHitsRatio >= 1){
            creep.memory.currentTarget = preferredTarget
        }
    }

    var t = Game.getObjectById(creep.memory.currentTarget.id);

    // console.log('getObjectByID for ' + creep.memory.currentTarget.id + ' returned ' + t)

    if(t) {
        console.log(creep.name + '|' + creep.memory.role + ' is repairing ' +
                t.id + ' - ' +
                t.structureType + ' has ' +
                numberWithCommas(t.hits) + ' of ' +
                numberWithCommas(t.hitsMax) + ' hit ratio of: ' +
                (calcRatio(t) * 100).toFixed(2) + '%');
        // Take Action
        //Move
        var results = creep.moveTo(t);
        if(results != OK) { console.log(creep.name + '|' + creep.memory.role + ' call to MoveTo returned: ' + displayError(results)); }
        // attempt repairGam
        results = creep.repair(t);
        if(results != OK && results != ERR_NOT_IN_RANGE) { console.log(creep.name + ' call to repair returned: ' + displayError(results)); }
    } else {
        console.log(creep.name + '|' + creep.memory.role + ' has a currentTarget that is ' + t)
    }
}