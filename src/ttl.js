import { LocalStorage } from "node-localstorage";

function next_forecast(){
    let local_storage = new LocalStorage('./update_record');// not only forecast
    let last_update=local_storage.getItem('last_update');
    if (!last_update){
        return 0;
    }else{
        return 
    }
}

// every sunday 1676260800000(360000000) + 86400*1000*7(604800000)
function next_expection(){
    let time=Date.now();
    return Math.ceil(time/604800000)*604800000;
}