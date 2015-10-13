module.exports = function(target){
  var RAMPART_HITS = 500000;
  var WALL_HITS = 1000000;
  var ratio = 0;

  if(target == null){
    return 1;
  }

  switch(target.structureType) {
  case 'rampart':
    ratio = target.hits / RAMPART_HITS;
    break;
  case 'constructedWall':
    ratio = target.hits / WALL_HITS;
    break;
  default:
    ratio = target.hits / target.hitsMax;
    break;
  }

  return ratio;
};