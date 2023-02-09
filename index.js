import * as dotenv from 'dotenv'
import {DNS, Record} from '@google-cloud/dns'

import {publicIpv4, publicIpv6} from 'public-ip';

if (process.env.NODE_ENV !== 'production') {
    console.log("using .env file")
    dotenv.config();
}

function main(){
    const zone_name=process.env.ZONE_NAME;
    const domain_name=process.env.DOMAIN_NAME;
    const ttl=process.env.TTL;
    const detect_interval=process.env.DETECT_INTERVAL;

    console.log("zone_name: ",zone_name);
    console.log("domain_name: ",domain_name);
    console.log("ttl: ",ttl);
    console.log("detect_interval: ",detect_interval);

    let last_ipv4;
    let last_ipv6;

    async function check(){
        let ipv4=await publicIpv4();
        console.log(ipv4);
        if (last_ipv4!=ipv4){
            await ddns_update("A",ipv4);
        }
        last_ipv4=ipv4;

        let ipv6=await publicIpv6();
        if (last_ipv6!=ipv6){
            await ddns_update("AAAA",ipv6);
        }
        last_ipv6=ipv6;
    }
    setInterval(check,detect_interval*1000);
    check();
}

async function ddns_update(record_type,expect_value){
    const domain_name=process.env.DOMAIN_NAME;
    const zone_name=process.env.ZONE_NAME;
    const ttl=process.env.TTL;
    const dns = new DNS();

    let zone=dns.zone(zone_name);

    let record_list= (await (zone.getRecords(record_type)))[0];
    let record=record_list.find((record)=>record.name== domain_name);

    if (record){
        console.log("deleting "+record_type+" ResourceRecordSet");
        await zone.deleteRecords(record);
    }
    console.log("creating "+record_type+" ResourceRecordSet");
    let new_record=new Record(zone,record_type,{
        data: expect_value,
        name: domain_name,
        ttl
    });
    await zone.addRecords(new_record);

    console.log("finished updating "+record_type+" record");
}

main();