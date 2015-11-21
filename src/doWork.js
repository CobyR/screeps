function doWork(){

  _.forEach(Game.rooms, function(room){
    var explorers = [];
    var builders = [];
    var harvesters = [];
    var guards = [];
    var hoarders = [];
    var sweepers = [];
    var transporters = [];
    var upgraders = [];
    var warriors = [];
    var medics = [];
    var runners = [];

    console.log(' ');
    log('------------------------------------------------', room.name);

    maintainLinks(room);

    ALLOW_SPAWN_USE = room.memory.useSpawn;

    USE_DROPS = room.memory.useDrops;

    _.forEach(Game.creeps, function(creep) {

      if(creep.pos.roomName != room.name){
        //
      } else {
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
        case 'upgrader':
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
        case 'runner':
          runners.push(creep.id);
          break;
        default:
          lca(creep, 'does not have a programmed role.');
          break;
        }
      }
      });

    processHarvesters(harvesters, room);
    processHoarders(hoarders, room);
    processUpgraders(upgraders,room);
    processSweepers(sweepers,room);
    processTransporters(transporters, hoarders, room);

    processGuards(guards,room);
    processWarriors(warriors,room);
    processMedics(medics,room);

    processBuilders(builders,room);
    processExplorers(explorers,room);
    processRunners(runners, room);
  });
}