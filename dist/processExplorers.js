module.exports = function(explorers) {
  var explore = require('explore');
  var assignNextPosition = require('explorerAssignNextPosition');
  var lca = require('logCreepAction');

  if(explorers.length > 0) {
    console.log('[Explorers] ------------------');
    var poss = [];

    for(var id in explorers) {
      var creep = Game.getObjectById(explorers[id]);
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
      if(commonDestination == '') {
         lca(creep, 'setting common destination',true);
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
          lca(creep, '   gaol == true');
          goal = true;
        } else {
          lca(creep, ' goal == false - ' + commonDestination.x + ',' + commonDestination.y);
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
};