var harvester = require('harvester');
var upgrade = require('upgrade');
var stayalive = require('stayalive');
var protect = require('protect');

var p_room = Game.rooms['W11S25']

for(var name in Game.creeps) {
    var creep = Game.creeps[name];

    if(creep.memory.role == 'guard') {
        protect(creep, p_room);
    }

    if(creep.memory.role == 'harvester') {
        harvester(creep, p_room);
    }

    if(creep.memory.role == 'upgrade') {
        upgrade(creep, p_room);
    }

    if(creep.memory.role == 'builder') {
        if(creep.carry.energy == 0  && Game.spawns.Harbor.energy > (Game.spawns.Harbor.energyCapacity - 50)) {
            creep.moveTo(Game.spawns.Harbor);
            Game.spawns.Harbor.transferEnergy(creep);
        }
        else {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                creep.moveTo(targets[0]);
                creep.build(targets[0]);
            }
        }
    }

}

stayalive(p_room);
