# google-ddns-js

Dymanic dns for cloud dns(GCP)

## Environment variable

```env
GOOGLE_APPLICATION_CREDENTIALS=<service account token path> // require if not on gcp
ZONE_NAME=<zone name>// require
DOMAIN_NAME=<FQDN(trailing "." included)>// require
TTL=<number in second>// require
DETECT_INTERVAL=<number in second>// default to 60sec
IPV4="true"|"false"// default to "true"
IPV6="true"|"false"// default to "false"
```

# Get started

## bare-metal

```shell
npm run production
```

## docker

1. start the container with environment variable

## docker on google cloud

1. configure the AIM setting, make sure the container have following premission

- dns.changes.create
- dns.changes.get
- dns.changes.list
- dns.projects.get
- dns.resourceRecordSets.create
- dns.resourceRecordSets.delete
- dns.resourceRecordSets.get
- dns.resourceRecordSets.list
- dns.resourceRecordSets.update

2. start the container with environment variable