function doWork(){
  var explorers = [];
  var builders = [];
  var workers = [];
  var guards = [];
  var hoarders = [];
  var sweepers = [];
  var transporters = [];

  for(var name in Game.creeps) {
    var creep = Game.creeps[name];

    if(creep.age < 25) {
      lca(creep, 'is about to die in ' + creep.age + ' ticks.');
    }

    switch(creep.memory.role) {
    case 'guard':
      guards.push(creep.id);
      break;
    case 'harvester':
      workers.push(creep.id);
      break;
    case 'upgrade':
      workers.push(creep.id);
      break;
    case 'builder':
      builders.push(creep.id);
      break;
    case 'explorer':
      explorers.push(creep.id);
      break;
    case 'hoarder':
      hoarders.push(creep.id);
      break;
    case 'sweeper':
      sweepers.push(creep.id);
      break;
    case 'transporter':
      transporters.push(creep.id);
      break;
    default:
      lca(creep, 'does not have a programmed role.');
      break;
    }
  }

  processGuards(guards, p_room);
  processWorkers(workers, p_room);
  processBuilders(builders, p_room);
  processHoarders(hoarders, p_room);
  processExplorers(explorers, p_room);
  processSweepers(sweepers, p_room);
  processTransporters(transporters, p_room);

}