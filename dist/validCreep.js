module.exports = function(creep) {
  if(typeof creep === 'undefined' || creep == null) {
    return false;
  } else {
    return true;
  }
}