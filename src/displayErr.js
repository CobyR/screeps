function displayErr(results) {
  switch(results) {
  case 7:
    return 'LEFT';
  case 3:
    return 'RIGHT';
  case 4:
    return 'BOTTOM_RIGHT';
  case 5:
    return 'BOTTOM';
  case 6:
    return 'BOTTOM_LEFT';
  case 8:
    return 'TOP_LEFT';
  case 2:
    return 'TOP_RIGHT';
  case 1:
    return 'TOP';
  case 0:
    return 'OK';
  case -1:
    return 'ERR_NOT_OWNER';
  case -2:
    return 'ERR_NO_PATH';
  case -3:
    return 'ERR_NAME_EXISTS';
  case -4:
    return 'ERR_BUSY';
  case -6:
    return 'ERR_NOT_ENOUGH_ENERGY';
  case -7:
    return 'ERR_INVALID_TARGET';
  case -8:
    return 'ERR_FULL';
  case -9:
    return 'ERR_NOT_IN_RANGE';
  case -10:
    return 'ERR_INVALID_ARGS';
  case -11:
    return 'ERR_TIRED';
  case -12:
    return 'ERR_NO_BODYPART';
  case -15:
    return 'ERR_GCL_NOT_ENOUGH';
  default:
    return results;
  }
}
