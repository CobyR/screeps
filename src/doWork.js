function doWork(){
  var explorers = [];
  var builders = [];
  var harvesters = [];
  var guards = [];
  var hoarders = [];
  var sweepers = [];
  var transporters = [];
  var upgraders = [];
  var warriors = [];
  var healers = [];


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
      harvesters.push(creep.id);
      break;
    case 'upgrade':
      upgraders.push(creep.id);
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

  processHarvesters(harvesters);
  processHoarders(hoarders);
  processUpgraders(upgraders);
  processSweepers(sweepers, p_room);
  processTransporters(transporters, p_room);

  processGuards(guards, p_room);
  processWarriors(warriors, p_room);
  processHealers(healers, p_room);

  processBuilders(builders, p_room);
  processExplorers(explorers, p_room);

}