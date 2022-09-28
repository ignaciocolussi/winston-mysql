# winston-mysql
MySQL transport plugin for winston@3.x logger

#### <https://github.com/charles-zh/winston-mysql> #

introduction
------------
This MySQL transport module is a plugin for winston@3.x logger running in node.js.

Current version plugin supports Winston@3.x.

synopsis
--------

Please check test/test.js for demo usage

```js

import MySQLTransport from 'winston-mysql';

const options_default = {
    host: 'localhost',
    user: 'logger',
    password: 'logger*test',
    database: 'WinstonTest',
    table: 'sys_logs_default'
};

//custom log table fields
const options_custom = {
    host: 'localhost',
    user: 'logger',
    password: 'logger*test',
    database: 'WinstonTest',
    table: 'sys_logs_custom',
    fields: {level: 'mylevel', meta: 'metadata', method:'methodField', endpoint: 'myEndpoint', req:'reqFiled', responseCode:'responseCodeField', res:'resField', timestamp: 'timestampField', responseTime:'rtField'}
};

//meta json log table fields
const options_json = {
    host: 'localhost',
    user: 'logger',
    password: 'logger*test',
    database: 'WinstonTest',
    table: 'sys_logs_json'
};

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        // or use: options_custom / options_json
        new MySQLTransport(options_default),
    ],
});





```

installation
------------
You should create a table in the database first.

Demos:
```SQL

 CREATE TABLE `WinstonTest`.`sys_logs_default` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `level` VARCHAR(16) NOT NULL,
 `metadata` JSON NOT NULL,
 `method` VARCHAR(5) NOT NULL,
 `endpoint` VARCHAR(500) NOT NULL,
 `req` JSON NOT NULL,
 `responsecode` INT NOT NULL,
 `res` JSON NOT NULL,
 `timestamp` DATETIME NOT NULL,
 `responsetime` INT NOT NULL,
 PRIMARY KEY (`id`));
 
 # or
 CREATE TABLE `WinstonTest`.`sys_logs_custom` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `level` VARCHAR(16) NOT NULL,
 `metadata` JSON NOT NULL,
 `methodField` VARCHAR(5) NOT NULL,
 `myEndpoint` VARCHAR(500) NOT NULL,
 `reqFiled` JSON NOT NULL,
 `responseCodeField` INT NOT NULL,
 `resField` JSON NOT NULL,
 `timestampField` DATETIME NOT NULL,
 `rtField` INT NOT NULL,
 PRIMARY KEY (`id`));
 
```
If you already have the log table, you can set custom fields for this module.

```js
//custom log table fields
const options_custom = {
    host: 'localhost',
    user: 'logger',
    password: 'logger*test',
    database: 'WinstonTest',
    tafields: {level: 'mylevel', meta: 'metadata', method:'methodField', endpoint: 'myEndpoint', req:'reqFiled', responseCode:'responseCodeField', res:'resField', timestamp: 'timestampField', responseTime:'rtField'}ble: 'sys_logs_custom',
    fields: {level: 'mylevel', meta: 'metadata', message: 'source', timestamp: 'addDate'}
};

```


Install via npm:

```sh
$ npm install winston-mysql
```

documentation
-------------

Head over to <https://github.com/charles-zh/winston-mysql>

run tests
-------------
Install docker & docker-compose.
Enter test directory and run:

```
docker-compose up

```

Then:

Open browser and visit: 127.0.0.1:8080. 

Login using user & password in docker-compose.yml

Create Tables using SQL commands above.

```sh
$ npm run test
```

authors
-------

charles-zh



