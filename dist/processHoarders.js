module.exports = function(hoarders, p_room) {
  var hoard = require('hoarder');

  if(hoarders.length > 0){
    console.log('[Hoarders] --------------');
    for(var id in hoarders) {
      var creep = Game.getObjectById(hoarders[id]);
      hoard(creep, p_room);
    }
  }
};