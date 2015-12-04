var GUARD = {
  1: [TOUGH, TOUGH, MOVE,
      MOVE, ATTACK, ATTACK],
  2: [TOUGH, TOUGH, MOVE,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK],
  3: [TOUGH, TOUGH, TOUGH,
      TOUGH, MOVE, MOVE,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK
     ],
  4: [TOUGH, TOUGH, TOUGH,
      TOUGH, MOVE, MOVE,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK,
      MOVE, ATTACK, ATTACK],
  5:[TOUGH, TOUGH, TOUGH,
     TOUGH, TOUGH, TOUGH,
     MOVE, MOVE, MOVE,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK,
     MOVE, ATTACK, ATTACK
    ]
}

function processGuards(guards) {
  if(guards.length > 0) {
    log('-------------------','Guards');

    for(var id in guards) {
      var creep = Game.getObjectById(guards[id]);
      if(creep.spawning) {
        lca(creep, 'is spawning.');
        return OK;
      } else {
        guardDuty(creep);
        lca(creep, 'is doing guard things.');
      }
    }
  }
}

function spawnGuard(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             GUARD, 'guard');
}

function guardDuty(creep) {
  // Check for hostiles
  var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
  var results = OK;

  if(enemies.length > 0){
    // There are hostiles in the room
    creep.memory.state = 'defending';
  } else {
    creep.memory.state = 'traveling';
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
          results = creep.moveTo(new RoomPosition(gf.x, gf.y, gf.roomName));
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

function protect(creep) {
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

        lca(creep, id + ':' + target.name , true);

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
