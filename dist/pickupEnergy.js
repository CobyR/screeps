module.exports = function(creep, drops) {
  var lca = require('logCreepAction');
  var displayErr = require('displayError');

  if(drops == null) {
      drops = Game.rooms.W11S25.find(FIND_DROPPED_ENERGY);
  }

  for(index in drops) {
    var drop = drops[index];

    var results = creep.pickup(drop);
    lca(creep, 'tried to pickup dropped energy: ' + displayErr(results));
  }
}