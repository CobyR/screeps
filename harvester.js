module.exports = function (creep) {

    if(creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);
    }
    else {
        if(Game.spawns.Harbor.energy == Game.spawns.Harbor.energyCapacity) {
            for(var id in Game.structures) {
                var structure = Game.structures[id];
                if(structure.structureType == 'extension') {
                    if(structure.energy < structure.energyCapacity) {
                        console.log(structure.id + ' needs energy, asking ' + creep.name + ' to transfer energy.');
                        creep.moveTo(structure.pos);
                        creep.transferEnergy(structure);
                    }
                    else {
                      creep.memory.role = 'upgrade';
                    }
                }
            }
        }
        else {
            creep.moveTo(Game.spawns.Harbor);
            creep.transferEnergy(Game.spawns.Harbor);
        }
    }
}