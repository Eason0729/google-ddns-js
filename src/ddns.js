import * as dotenv from 'dotenv'
import {DNS, Record} from '@google-cloud/dns'

import {publicIpv4, publicIpv6} from 'public-ip';

import { LocalStorage } from "node-localstorage";

async function ddns_check(){
    
    let local_storage = new LocalStorage('./current_value');
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

    console.log("finished updating A record");
}