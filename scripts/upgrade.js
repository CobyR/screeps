module.exports = function (creep, p_room) {

    if(creep.memory.state == 'fill') {
        if(creep.carry.energy == creep.carryCapacity) {
            if(Game.spawns.Harbor.energy < Game.spawns.Harbor.energyCapacity) {
                creep.memory.role = 'harvester';
                console.log(creep.name + ' is now in \'harvester\' mode.');
            }
            else {
                creep.memory.state = 'upgrade';
                console.log(creep.name + ' is now in \'upgrade\' mode.');
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
        creep.moveTo(p_room.controller);
        creep.upgradeController(p_room.controller);
    }
}
