module.exports = function(guards, p_room) {
  console.log('[Guards   ] -------------------');

  var protect = require('protect');

  for(var id in guards) {
    var creep = Game.getObjectById(guards[id]);
    protect(creep, p_room);
  }
}