module.exports = function (creep) {

    if(creep.memory.state == 'fill') {
        if(creep.carry.energy == creep.carryCapacity) {
            if(Game.spawns.Harbor.energy < Game.spawns.Harbor.energyCapacity) {
                creep.memory.role = 'harvester';
            }
            else {
                creep.memory.state = 'upgrade';
            }
        }
    }
    else {
        if(creep.carry.energy == 0) {
            creep.memory.state = 'fill';
        }
    }

    if(creep.carry.energy == 0  || creep.memory.state == 'fill') {
        var sources = creep.room.find(FIND_SOURCES);
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);
    }
    else {
        creep.moveTo(Game.rooms.E15S3.controller);
        creep.upgradeController(Game.rooms.E15S3.controller);
    }
}