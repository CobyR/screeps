module.exports = function(guards, p_room) {
  var protect = require('protect');

  for(var id in guards) {
    var creep = Game.getObjectById(guards[id]);
    protect(creep, p_room);
  }
}