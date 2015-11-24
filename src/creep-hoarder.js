var HOARDER = {
  /* six work parts is sufficient to drawn a source in 300 ticks,
   * no need for bigger creeps in this role.
   */
  1: [MOVE, WORK, WORK],
  2: [MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  3: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  4: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  5: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  6: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  7: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK],
  8: [MOVE, WORK, WORK,
      MOVE, WORK, WORK,
      MOVE, WORK, WORK]
}

function processHoarders(hoarders, room) {
  var HOARD_REMOTE = false;

  if(hoarders.length > 0){
    log('-------------- ' + hoarders.length,'Hoarders', room.name);
    var i = 0;
    for(var id in hoarders) {
      var creep = Game.getObjectById(hoarders[id]);

      if(creep.spawning === true) {
        lca(creep, 'is still spawning.');
      } else {
        i++;
        // console.log( i + " " + i % 2);
        hoard(creep, i % 2);
      }
    }
  }
}

function spawnHoarder(spawn, room, current, max){
  spawnCreep(spawn, room, current, max,
             HOARDER, 'hoarder');
}

function hoard(creep, source_index) {

  var busy = 0;

  if(creep.spawning){
    lca(creep, 'is still spawning.');
    return OK;
  }

  callForReplacement(creep);

  // validate that transporter is alive, if not clear
  if(creep.memory.transporter){
    var tCreep = Game.getObjectById(creep.memory.transporter.id);
    if(!tCreep){
      creep.memory.transporter = null;
    }
  }

  switch(creep.memory.state){
  case 'transferring':
    var target = creep.room.storage;

    if(target){
      lca(creep, 'is taking energy (' +
          creep.carry.energy +
          ') to storage (' +
          nwc(target.store.energy) +
          ' of ' + nwc(target.storeCapacity) + ').');

      creep.moveTo(creep.room.storage);
      creep.transferEnergy(creep.room.storage);

      if(creep.carry.energy === 0 ){
        creep.memory.state = 'gathering';
      }
    }
    break;
  case 'gathering':
    var sources = creep.room.find(FIND_SOURCES);

    if(source_index >= sources.length){
      source_index = sources.length -1;
    }

    if(sources[source_index].energy === 0 && sources.length == 2){
      source_index = (source_index == 1) ? 0 : 1;
    }

    lca(creep, 'my source has ' + sources[source_index].energy + ' energy and will regenerate in ' + sources[source_index].ticksToRegeneration + '.');

    creep.moveTo(sources[source_index]);
    creep.harvest(sources[source_index]);

    lca(creep, 'sources.length ' + sources.length + ' vs ' + source_index,true);

    if(creep.carry.energy == creep.carryCapacity && creep.carryCapacity !== 0) {
      creep.memory.state = 'transferring';
    }
    break;
  default:
    creep.memory.state = 'gathering';
  }
}

function remoteHoard(creep) {

  if(creep.spawning) {
    lca(creep, 'is still spawning.');
    return 0;
  }


  if(creep.memory.state == 'fill' || creep.carry.energy === 0) {
    creep.moveTo(creep.room.storage);
    creep.room.storage.transferEnergy(creep,creep.carryCapacity - creep.carry.energy);
    lca(creep, 'getting ' + creep.carryCapacity - creep.carry.energy + ' from storage.');
  } else {
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
    lca(creep, 'upgrading controller, ' + creep.carry.energy + ' energy until empty.');
  }
}