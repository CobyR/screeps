function hoard(creep, source_index) {

  var busy = 0;

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

    lca(creep, 'is gathering energy ' + creep.carry.energy + ' of ' + creep.carryCapacity + '.');

    //console.log('source_index: ' + source_index + ' sources.length: ' + sources.length);

    if(source_index >= sources.length){
      source_index = sources.length -1;
    }

    if(sources[source_index].energy === 0 ){
      source_index = (source_index == 1) ? 0 : 1;
    }

    creep.moveTo(sources[source_index]);
    creep.harvest(sources[source_index]);

    if(creep.carry.energy == creep.carryCapacity && creep.carryCapacity !== 0) {
      creep.memory.state = 'transferring';
    }
    break;
  default:
    creep.memory.state = 'gathering';
  }
}