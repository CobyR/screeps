var displayErr = require('displayError');
var lca = require('logCreepAction');

module.exports = function (creep, p_room) {
  if(creep.spawning == true) {
    lca(creep, 'is still spawning.');
    return 0;
  }

  var targets = creep.room.find(FIND_HOSTILE_CREEPS);
  if(targets.length) {
    // There are hostiles, run without concern and attack them.
    lca(creep, ' has found ' + targets.length + ' hostiles.');
    creep.moveTo(targets[0]);
    creep.attack(targets[0]);
  } else {
    // There are no hostiles, move to a flag.
    if(typeof creep.memory.destination === 'undefined' || creep.memory.destination == null) {
      targets = p_room.find(FIND_FLAGS, { filter: { color: COLOR_RED}});
      //lca(creep,'found ' + targets.length + ' flags', true);
      for(var id in targets) {
        var target = targets[id];

        // lca(creep, id + ':' + target.name , true);

        var t = target;

        // lca(creep, t.color + ' flag at ' + t.pos.x + ' x ' + t.pos.y + ' manned by ' + t.memory.manned + '.',true);

        // Check to see if flag is occupied
        if(typeof target.memory.manned === 'undefined' || target.memory.manned == null) {
          creep.memory.destination = target;
          target.memory.manned = creep;
          creep.memory.state = 'traveling';
          lca(creep, 'is assigned to ' + creep.memory.destination.name + ' which is manned by ' + target.memory.manned.name, true);
          break;  // break the for loop so the guard doesn't get assigned to multiple flags
        } else {
          // house cleaning - make sure creep is alive, if not clear manned position
          var checkCreep = Game.getObjectById(target.memory.manned.id);
          // lca(creep,'check creep returned:' + checkCreep + ' for ' + target.name,true);
          if(checkCreep == null) {
            console.log('[DEBUG] the creep guarding ' + target.name + ' is gone...');
            target.memory.manned = null;
          } else {
            var checkFlag = Game.getObjectById(checkCreep.memory.destination.id);

            if(checkFlag == null) {
              console.log('[DEBUG] the target ' + checkCreep.memory.destination.name + 'does not exist, clearing memory.');
              checkCreep.memory.destination = null;
            }
          }
        }
      }
      if(typeof creep.memory.destination === 'undefined' || creep.memory.destination == null) {
        creep.memory.state = 'roaming';
        lca(creep, 'does not have a specific destination.');
      }

    } else {
      // assignment is set
      if(creep.memory.state == 'traveling') {
        lca(creep, 'is traveling to flag: ' + creep.memory.destination.name + ' - ' + creep.memory.destination.id);
        var dest = Game.getObjectById(creep.memory.destination.id);

        var results = creep.moveTo(dest);
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
        var dest = Game.getObjectById(creep.memory.destination.id);
        if(dest != null) {
          var gf = dest.memory.guard_from || dest.pos;

          if(gf) {
            // guard_from is set on the flag
            if(creep.pos.x == gf.x && creep.pos.y == gf.y) {
              // do nothing in the correct location
              // lca(creep,'is in the right guard from location',true);
            } else {
              lca(creep,'needs to move to guard from location',true);
              var results = creep.moveTo(gf.x, gf.y);
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
};
