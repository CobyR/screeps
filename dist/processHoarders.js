module.exports = function(hoarders, p_room) {
  var hoard = require('hoarder');
  var hoardRCL = require('hoarderRcl');

  if(hoarders.length > 0){
    console.log('[Hoarders] --------------');
    var i = 0;
    for(var id in hoarders) {
      var creep = Game.getObjectById(hoarders[id]);
      i++;
      // console.log( i + " " + i % 2);
      if(creep.room.name == 'W11S25' && i % 2 == 0 && creep.room.storage.store.energy > 100000 + creep.carryCapacity) {
        hoardRCL(creep);
      } else {
        hoard(creep, p_room);
      }
    }
  }
};