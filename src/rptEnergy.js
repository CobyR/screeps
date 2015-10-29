function totalEnergy() {
  var tE = 0;

  var structures = p_room.find(FIND_MY_STRUCTURES);
  var extensions = [];
  var spawns = [];

  for(var name in structures){
    var structure = structures[name];
    var ext = null;

    switch(structure.structureType) {
    case 'extension':
      // console.log('Extension: ' + structure.id + ' - ' + structure.energy);
      tE += structure.energy;
      break;
    case 'spawn':
      // console.log('Spawn: ' + structure.name + ' - ' + structure.energy);
      tE += structure.energy;
      break;
    default:
    }
  }

  return tE;
}