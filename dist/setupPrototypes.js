module.exports = function(){

  Structure.prototype.needsRepair = function(name) {
    return this.hits < this.hitsMax / 2;
  };


}