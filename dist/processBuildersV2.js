module.exports = function(builders, p_room){
  var lca = require('logCreepAction');
  var calcRatio = require('calculateStructureHealthRatio');
  var displayErrror = require('displayError');
  var nwc = require('numberWithCommas');
  var validCreep = require('validCreep');

  var MIN_HITS = 2000;
  var GAP_BEFORE_CHANGING_TARGET = 0.03;

  if(builders.length > 0){
    console.log('[Builders] --------------- ' + builders.length);
    var index = -1;

    var constructionSites = p_room.find(FIND_MY_CONSTRUCTION_SITES);
    var structures = p_room.find(FIND_STRUCTURES);

    // Evaluate all structures if any are below MIN_HITS fix them first
    var fixFirstStructures = [];
    var remainingStructures = [];

    for(var id in structures) {
      var t = structures[id];
      if(t.structureType != 'controller' && t.structureType != 'extension' && t.structureType != 'storage'){
        if(t.hits < MIN_HITS){
          fixFirstStructures.push(t);
        } else {
          remainingStructures.push(t);
        }
      }
    }

    console.log('There are ' + fixFirstStructures.length + ' fixFirstStructures and ' + remainingStructures.length + ' remaining structures.');

    // Assign builders to fixFirst Structures
    var builders_index = -1;

    for(id in fixFirstStructures){
      var t = fixFirstStructures[id];
      builders_index ++;
      var creep = Game.getObjectById(builders[builders_index]);
      if(validCreep(creep)) {
        creep.memory.state = 'emergency';
        creep.memory.currentTarget = t;
        lca(creep, 'has been assigned ' +
                     t.structureType +
                     ' at ' +
                     t.pos.x +
                     ',' +
                     t.pos.y +
                     ' with hits of ' +
                     t.hits + ' for immediate repair.');
      } else {
        // builders_index is greater than builders
        console.log('INVALID CREEP - assumption: reached the end of builders ' + builders_index + ' of ' + builders.length);
        break;
      }
    }

    if(builders.length > fixFirstStructures.length) {
      // there are extra builders after fixFirst assign them to ConstructionSites
      if(constructionSites.length > 0){
        for(id in constructionSites){
          var site = constructionSites[id];
          builders_index ++;
          creep = Game.getObjectById(builders[builders_index]);
          if(validCreep(creep)) {
            creep.memory.state = 'constructing';
            creep.memory.currentTarget = site;
            lca(creep, 'has been assigned ' +
                   site.structureType +
                   ' at ' +
                   site.pos.x +
                   ',' +
                   site.pos.y +
                   ' for construction.');
          } else {
          // builders_index is greater than builders
          console.log('reached the end of builders ' + builders_index + ' of ' + builders.length);
          break;
        }
        }
      }
    }

    if(builders.length > (fixFirstStructures.length + constructionSites.length)) {
      // there are extra builders after fixFirst and constructionSites
      for(id in remainingStructures){
        var s = remainingStructures[id];

        builders_index ++;

        creep = Game.getObjectTypeById(builders[builders_index]);
        if(validCreep(creep)) {
          creep.memory.state = 'repairing';
          creep.memory.currentTarget = s;
          lca(creep, 'has been assigned ' +
                     s.structureType +
                     ' at ' +
                     s.pos.x +
                     ',' +
                     s.pos.y +
                     ' with hits of ' +
                     s.hits + 'for repair.');
        } else {
          // builders_index is greater than builders
          console.log('reached the end of builders ' + builders_index + ' of ' + builders.length);
          break;
        }
      }
    }

    // Tell builders to go do there thing
    for(id in builders){
      creep = Game.getObjectById(builders[id]);
      var t = Game.getObjectById(creep.memory.currentTarget.id);

      creep.moveTo(t);
      switch(creep.memory.state){
      case 'repairing':
        creep.repair(t);
        break;
      case 'constructing':
        creep.build(t);
        break;
      case 'emergency':
        creep.repair(t);
        break;
      default:
        lca(creep, 'has an invalid state: ' + creep.memory.state);
      }
    }
  }
}