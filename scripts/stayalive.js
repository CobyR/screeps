/*
 * Stayalive - code to keep breeding creeps
 */
 module.exports = function() {
   var workers = 0;
   var guards = 0;
   var builders = 0;
   var warriors = 0;
   var healers = 0;

   var MAX_WORKERS = 5;
   var MAX_GUARDS = 2;
   var MAX_BUILDERS = 2;
   var MAX_WARRIORS = 0;
   var MAX_HEALERS = 0;

   for(var name in Game.rooms) {
     var room = Game.rooms[name];

     if(typeof room.memory.worker_count === 'undefined') {
       room.memory.worker_count = 0;
       room.memory.builder_count = 0;
       room.memory.guard_count = 0;
       room.memory.warrior_count = 0;
       room.memory.healer_count = 0;
     }
   }

   for(var name in Game.creeps) {
     var creep = Game.creeps[name];

     if(creep.memory.role == 'harvester' || creep.memory.role == 'upgrade') {
       workers += 1 ;
     }

     if(creep.memory.role == 'guard') {
       guards += 1;
     }

     if(creep.memory.role == 'builder') {
       builders += 1;
     }
   }

   if(workers < MAX_WORKERS) {
     if(Game.spawns.Harbor.energy >= 150) {
       var results = Game.spawns.Harbor.createCreep( [MOVE, CARRY, WORK], Game.rooms.W11S23.memory.worker_counter, { role: 'harvester'});
       console.log('Spawning a new worker - ' + results +'.');
       if(results == 0 || results == -3) {
         Game.rooms.W11S23.memory.worker_counter +=1;
       }
     }
     else {
            if(Game.spawns.Harbor.energy % 25 == 0) {
            console.log('I wanted to spawn a worker - energy levels at ' + Game.spawns.Harbor.energy + ' of required 150.');
              }
     }
   }

   if(guards < MAX_GUARDS && workers == MAX_WORKERS) {
        if(Game.spawns.Harbor.energy >=200){
          console.log('Spawning a new guard.');
          var results = Game.spawns.Harbor.createCreep([TOUGH,ATTACK,MOVE,MOVE], 'g' + Game.rooms.W11S23.memory.guard_counter, { role: 'guard'});
        if(results ==0 || results == -3) {
          Game.rooms.W11S23.memory.guard_counter +=1;
          }
            }
     else {
       console.log('I wanted to spawn a guard but don\'t have enough energy.');
        }
   }
   if(builders < MAX_BUILDERS && workers == MAX_WORKERS && guards == MAX_GUARDS) {
     if(Game.spawns.Harbor.energy > 200){
       console.log('Spawning a new builder.');
         var results = Game.spawns.Harbor.createCreep([WORK,WORK,CARRY,MOVE], 'b' + Game.rooms.W11S23.memory.builder_counter, { role: 'builder'});
       if(results == 0 || results == -3) {
         Game.rooms.W11S23.memory.builder_counter += 1;
       }
     }
     else {
       if(Game.spawns.Harbor.energy % 25 == 0) {
       console.log('I wanted to spawn a builder - energy levels at ' + Game.spawns.Harbor.energy + ' of required 200.');
       }
     }
   }
 }