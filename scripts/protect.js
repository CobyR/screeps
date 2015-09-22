/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('protect'); // -> 'a thing'
 */

 module.exports = function (creep) {
     var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if(targets.length) {
        creep.moveTo(targets[0]);
        creep.attack(targets[0]);
    }
    else {
        for(var name in Game.flags) {
            var flag = Game.flags[name];
            if(flag.memory.purpose == 'guard'){
                if(creep.memory.action != 'onway' &&
                    flag.memory.guards < flag.memory.max_guards
                    && creep.memory.action != 'guarding') {
                    creep.memory.destination = flag
                    creep.memory.action = 'onway'
                    flag.memory.guards += 1;
                }
            }
        }
        if(typeof creep.memory.destination === 'undefined'){

        }
        else {
            console.log(creep.name + ' is moving to ' + creep.memory.destination.name);
        }
        if(typeof creep.memory.destination === 'undefined') {

        }
        else {
            if(creep.pos == creep.memory.destination.pos) {
                console.log(creep.name + ' has arrived at ' + creep.memory.destination.name);
                creep.memory.action = 'guarding';
            }
        }
        if(creep.memory.action == 'onway') {
            creep.moveTo(creep.memory.destination);
        }
    }
}
