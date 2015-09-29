/*
 * Stayalive - code to keep breeding creeps
 */
module.exports = function(p_room) {
  var displayError = require('displayError');

  var workers = 0;
  var harvesters = 0;
  var upgraders = 0;
  var guards = 0;
  var builders = 0;
  var warriors = 0;
  var healers = 0;
  var explorers = 0;
  var hoarders = 0;

  var MAX_WORKERS = 8;
  var MAX_GUARDS = 4;
  var MAX_BUILDERS = 2;
  var MAX_WARRIORS = 0;
  var MAX_HEALERS = 0;
  var MAX_EXPLORERS = 0;
  var MAX_HOARDERS = 0;

  if(typeof p_room.memory.worker_counter === 'undefined') {
    p_room.memory.worker_counter = 0;
    p_room.memory.builder_counter = 0;
    p_room.memory.guard_counter = 0;
    p_room.memory.warrior_counter = 0;
    p_room.memory.healer_counter = 0;
    p_room.memory.explorer_counter = 0;
    p_room.memory.horder_counter = 0;
  }

  // count creeps
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];

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

  // calculate MAX #'s
  if(workers < 4 ) {
    MAX_WORKERS = 4;
    MAX_GUARDS = 1;
    MAX_BUILDERS = 0;
  } else if (workers == 4 && guards == 1) {
    MAX_WORKERS = 6;
    MAX_BUILDERS = 1;
  } else if (workers == 6 && guards == 1) {
    MAX_BUILDERS =2;
  }

  // report stats
  console.log('There are currently ' + workers + ' workers h:' + harvesters + '/ u:' + upgraders + ', ' +
              guards + ' guards, ' +
              builders + ' builders, ' +
              explorers + ' explorers, and ' +
              hoarders + ' hoarders.');

  // spawn guards
  if(guards < MAX_GUARDS && workers > MAX_WORKERS / 2 ) {
    if(p_room.energyAvailable >=200){
      console.log('Spawning a new guard.');
      var results = Game.spawns.Harbor.createCreep([TOUGH,ATTACK,ATTACK,MOVE,MOVE], 'g' + p_room.memory.guard_counter, { role: 'guard'});
      if(results == OK || results == ERR_NAME_EXISTS) {
        p_room.memory.guard_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a guard - energy levels at ' + Game.spawns.Harbor.energy + ' of required 270.');
    }
  }


  // spawn workers
  if(workers < MAX_WORKERS && (guards >= MAX_GUARDS || workers < 5)) {
    if(p_room.energyAvailable >= 250) {
      var results = Game.spawns.Harbor.createCreep( [MOVE, CARRY, CARRY,WORK], 'w' + p_room.memory.worker_counter, { role: 'harvester', locked: false});
      console.log('Spawning a new worker - ' + displayError(results) +'.');
      if(results == OK || results == ERR_NAME_EXISTS) {
        p_room.memory.worker_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a worker - energy levels at ' + Game.spawns.Harbor.energy + ' of required 250.');
    }
  }

  // spawn hoarders
  if( hoarders < MAX_HOARDERS && workers >= MAX_WORKERS) {
    if(p_room.energyAvailable >= 250) {
      var results = Game.spawns.Harbor.createCreep( [MOVE, CARRY, CARRY,WORK], 'w' + p_room.memory.worker_counter, { role: 'hoarder', locked: true});
      console.log('Spawning a new hoarder - ' + displayError(results) +'.');
      if(results == OK || results == ERR_NAME_EXISTS) {
        p_room.memory.hoarder_counter +=1;
      }
    } else {
      console.log('I wanted to spawn a hoarder - energy levels at ' + Game.spawns.Harbor.energy + ' of required 250.');
    }
  }


  // spawn builders
  if(builders < MAX_BUILDERS && workers >= MAX_WORKERS && guards >= MAX_GUARDS) {
    if(p_room.energyAvailable >= 300){
      var results = OK;
      if(p_room.energyAvailable < 400) {
	results = Game.spawns.Harbor.createCreep([WORK,CARRY,CARRY,MOVE], 'a' + p_room.memory.builder_counter, {role: 'builder', state: 'constructing'});
      } else if(p_room.energyAvailable >= 400) {
        results = Game.spawns.Harbor.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], 'b' + p_room.memory.builder_counter, { role: 'builder', state: 'constructing'});
      }
      console.log('Spawning a new builder ' + displayError(results));
      if(results == OK || results == ERR_NAME_EXISTS) {
        p_room.memory.builder_counter += 1;
      }
    } else {
      console.log('I wanted to spawn a builder - energy levels at ' + p_room.energyAvailable + ' of required 300.');
    }
  }


  // spawn explorers
  if(explorers < MAX_EXPLORERS  && workers >= MAX_WORKERS && guards >= MAX_GUARDS && builders >= MAX_BUILDERS) {
    if(p_room.energyAvailable >= 300) {
      var explorerName = 'e' + p_room.memory.explorer_counter;
      console.log('Spawning a new explorer - ' + explorerName + '.');

      var results = Game.spawns.Harbor.createCreep([MOVE,MOVE,CARRY,WORK], explorerName, { role: 'explorer', mode: 'manual'});
      if(results == OK || results == ERR_NAME_EXISTS) {
        p_room.memory.explorer_counter += 1;
      } else {
        console.log('trying to create an explorer resulted in ' + displayError(results));
      }
    } else {
      console.log('I wanted to spawn an explorer - energy levels at ' + Game.spawns.Harbor.energy + ' of required 300');
    }
  }

  // clean memory
  // var noticeMessage = '';

  // for(var i in Memory.creeps) {
  //   if(!Game.creeps[i]) {
  //    var message = '[MAINTENANCE] deleting memory for ' + i;
  //    console.log(message );
  //    noticeMessage += message + '\n';
  //    delete Memory.creeps[i];
  //  }
  //}
  //if(noticeMessage.length > 0) {
  //  Game.notify(noticeMessage);
  //}
};