function log(message, classification){
  switch(classification){
  case 'creep':
    if(creepReports()){
      console.log(message);
    }
    break;
  default:
    console.log(message);
  }
}
