module.exports = function(hoarders, p_room) {
  var hoard = require('hoarder');

  for(var id in hoarders) {
    var creep = Game.getObjectById(hoarders[id]);
    hoard(creep, p_room);
  }
}