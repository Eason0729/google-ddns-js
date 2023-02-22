import * as dotenv from 'dotenv'
import {DNS, Record} from '@google-cloud/dns'

import {publicIpv4, publicIpv6} from 'public-ip';

import pino from 'pino';
import pretty from 'pino-pretty'

var logger;
if (process.env.NODE_ENV !== 'production') {
    logger=pino({ level: 'trace' },pretty());
    console.log("using .env file")
    dotenv.config();
}else{
    logger=pino({ level: 'info' },pretty());
}


function main(){
    const zone_name=process.env.ZONE_NAME;
    const domain_name=process.env.DOMAIN_NAME;
    const ttl=process.env.TTL;
    const detect_interval=process.env.DETECT_INTERVAL || 60;

    logger.info(`
server running with config:
zone_name: ${zone_name}
domain_name: ${domain_name}
ttl: ${ttl}
detect_interval: ${detect_interval}`,);

    async function check_ipv4(){
        let last_ipv4=await publicIpv4({onlyHttps:true});
        await ddns_update("A",last_ipv4);
        setInterval(async()=>{
            logger.trace(`checking ipv4`);
            let ipv4=await publicIpv4({onlyHttps:true});
            if (last_ipv4!=ipv4){
                logger.debug(`ipv4 changed from ${last_ipv4} to ${ipv4}`);
                await ddns_update("A",ipv4);
            }
            last_ipv4=ipv4;
        }
        ,detect_interval*1000
        );
    }
    async function check_ipv6(){
        let last_ipv6=await publicIpv6({onlyHttps:true});;
        await ddns_update("AAAA",last_ipv6);
        setInterval(async()=>{
            let ipv6=await publicIpv6({onlyHttps:true});
            if (last_ipv6!=ipv6){
                logger.debug(`ipv6 changed from ${last_ipv6} to ${ipv6}`);
                await ddns_update("AAAA",ipv6);
            }
            last_ipv6=ipv6;
        }
        ,detect_interval*1000
        );
    }

    const enable_ipv4=(process.env.IPV4 || "true")=="true";
    const enable_ipv6=(process.env.IPV6 || "false")=="true";

    if (enable_ipv4)
        check_ipv4();
    if (enable_ipv6)
        check_ipv6();
}

async function ddns_update(record_type,expect_value){
    logger.info(`asyncing ${record_type} record`);
    const domain_name=process.env.DOMAIN_NAME;
    const zone_name=process.env.ZONE_NAME;
    const ttl=process.env.TTL;
    const dns = new DNS();

    let zone=dns.zone(zone_name);

    let record_list= (await (zone.getRecords(record_type)))[0];
    let record=record_list.find((record)=>record.name== domain_name);

    if (record){
        await zone.deleteRecords(record);
    }
    let new_record=new Record(zone,record_type,{
        data: expect_value,
        name: domain_name,
        ttl
    });
    await zone.addRecords(new_record);

}

main();
