function guardDuty(creep) {
  // Check for hostiles
  var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
  var results = OK;

  if(enemies.length > 0){
    // There are hostiles in the room
    creep.memory.state = 'defending';
  }

  switch(creep.memory.state){
  case 'guarding':
    // a guard at it's assigned location
    var guardFrom = Game.getObjectById(creep.memory.destination.id);

    if(guardFrom !== null){
      var gf = guardFrom.memory.guard_from || guardFrom.pos;

      if(gf){
        if(creep.pos.x == gf.x && creep.pos.y == gf.y){
          lca(creep, 'has reached the guardFrom location.', true);
        } else {
          lca(creep, 'needs to move to guard from location.', true);
          results = creep.moveTo(gf.x, gf.y);
          if(results != OK && results != ERR_TIRED){
            lca(creep, 'err while moving to gf ' + displayErr(results));
          }
        }
      }
    }
    break;
  case 'traveling':
    // what a guard does when it is not at it's assigned location
    if(typeof creep.memory.destination === 'undefined' ||
      creep.memory.destination === null) {
      setGuardAssignment(creep);
    } else {
      // has an assignment - proceed
      var dest = Game.getObjectById(creep.memory.destination.id);

      results = creep.moveTo(dest);

      if(results != OK && results != ERR_TIRED){
        lca(creep, 'when asked to move the results where: ' + displayErr(results));
      } else {
        // check to see if the creep is at the destination if so switch to guarding
        if(creep.pos.x == dest.pos.x && creep.pos.y == dest.pos.y){
          lca(creep, 'has arrived at destination', true);
          creep.memory.state = 'guarding';
        }
      }
    }
    break;
  case 'roaming':
    // what a guard does when it doesn't have an assigned location.
    break;
  case 'defending':
    var enemy = findNearestEnemy(creep, enemies);
    creep.moveTo(enemy);
    creep.attack(enemy);
    break;
  case 'attacking':
    // This is an offensive posture when guards are out and about
    break;
  default:
    if(typeof creep.memory.state === 'undefined'){
      creep.memory.state = 'traveling';
    } else {
      lca(creep, 'WTF? my state is: ' + creep.memory.state + ' and there is no case for that...');
    }
  }
}

function setGuardAssignment(creep){
  var flags = creep.room.find(FIND_FLAGS, { filter: { color: COLOR_RED }});
  var i = '';

  // check flags and assign one if needed to the creep
  for( i in flags){
    var t = flags[i];
    if(t.pos.roomName == creep.pos.roomName){
      if(typeof t.memory.manned === 'undefined' || t.memory.manned === null){
        // flag is unmanned
        t.memory.manned = creep;
        creep.memory.destination = t;
        return OK;
      } else {
        // flag is already manned
        // house cleaning - make sure the creep assigned is alive
        var assignedCreep = Game.getObjectById(t.memory.manned.id);
        if(assignedCreep === null){
          lca(creep, 'flag was assigned to: ' + t.memory.manned.name + ' who is no longer available, clearing and taking over.', true);
          t.memory.manned = creep;
          creep.memory.destination = t;
          return OK;
        } else {
          // assigned creep is alive and well
        }
      }
    } else {
      // flag is not in the same room as creep
    }
  }
  // No flag was assigned or we wouldn't reach this point in the code
  creep.memory.state = 'roaming';
  lca(creep,'is roaming since no flags in this room need guards.');
}
