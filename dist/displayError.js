module.exports = function(results) {
  switch(results) {
  case 7:
    return 'LEFT';
    break;
  case 3:
    return 'RIGHT';
    break;
  case 4:
    return 'BOTTOM_RIGHT';
    break;
  case 5:
    return 'BOTTOM';
    break;
  case 6:
    return 'BOTTOM_LEFT';
    break;
  case 8:
    return 'TOP_LEFT';
    break;
  case 2:
    return 'TOP_RIGHT';
    break;
  case 1:
    return 'TOP';
    break;
  case 0:
    return 'OK';
    break;
  case -1:
    return 'ERR_NOT_OWNER';
    break;
  case -2:
    return 'ERR_NO_PATH';
    break;
  case -4:
    return 'ERR_BUSY';
    break;
  case -6:
    return 'ERR_NOT_ENOUGH_ENERGY';
    break;
  case -7:
    return 'ERR_INVALID_TARGET';
    break;
  case -8:
    return 'ERR_FULL';
  break;
  case -9:
    return 'ERR_NOT_IN_RANGE';
    break;
  case -11:
    return 'ERR_TIRED';
    break;
  case -12:
    return 'ERR_NO_BODYPART';
    break;
  case -15:
    return 'ERR_GCL_NOT_ENOUGH';
    break;
  default:
    return results;
  }
};