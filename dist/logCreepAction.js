/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('logCreepAction'); // -> 'a thing'
 */
 module.exports = function(creep, message, debug) {
     if(debug) {
        console.log('[DEBUG] ' + creep.name + '|' + creep.memory.role + ' ' + message);
     } else {
        console.log(creep.name + '|' + creep.memory.role + ' (' + creep.memory.state + ') ' + message);
     }

}