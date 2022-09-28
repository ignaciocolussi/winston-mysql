/**
 * This is a MySQL transport module for winston.
 * https://github.com/winstonjs/winston
 * Notice: User should create a log table in MySQL first,
 * the default table fields are 'level', 'meta', 'message', 'timestamp'. But you can
 * use your custom table fields by setting: options.fields.
 * Example: options.fields = { level: 'mylevel', meta: 'metadata', message: 'source', timestamp: 'addDate'}
 * Two demo tables:
 *
 CREATE TABLE `WinstonTest`.`sys_logs_default` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `level` VARCHAR(16) NOT NULL,
 `message` VARCHAR(2048) NOT NULL,
 `meta` VARCHAR(2048) NOT NULL,
 `timestamp` DATETIME NOT NULL,
 PRIMARY KEY (`id`));
 *
 CREATE TABLE `WinstonTest`.`sys_logs_custom` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `mylevel` VARCHAR(16) NOT NULL,
 `source` VARCHAR(1024) NOT NULL,
 `metadata` VARCHAR(2048) NOT NULL,
 `addDate` DATETIME NOT NULL,
 PRIMARY KEY (`id`));
 *
 CREATE TABLE `WinstonTest`.`sys_logs_json` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `level` VARCHAR(16) NOT NULL,
 `message` VARCHAR(2048) NOT NULL,
 `meta` JSON NOT NULL,
 `timestamp` DATETIME NOT NULL,
 PRIMARY KEY (`id`));

 */

const Transport = require('winston-transport');
const MySql = require('mysql2');

/**
 * @constructor
 * @param {Object} options      Options for the MySQL & log plugin
 * @param {String} options.host Database host
 * @param {String} options.user Database username
 * @param {String} options.password Database password
 * @param {String} options.database Database name
 * @param {String} options.table  Database table for the logs
 * @param {Object} **Optional** options.fields Log object, set custom fields for the log table
 */
module.exports = class MySQLTransport extends Transport {
    constructor(options = {}) {
        super(options);

        this.name = 'MySQL';

        //Please visit https://github.com/felixge/node-mysql#connection-options to get default options for mysql module
        this.options = options || {};

        // check parameters
        if(!options.host){
            throw new Error('The database host is required');
        }
        if(!options.user){
            throw new Error('The database username is required');
        }
        if(!options.password){
            throw new Error('The database password is required');
        }
        if(!options.database){
            throw new Error('The database name is required');
        }
        if(!options.table){
            throw new Error('The database table is required');
        }

        //check custom table fields - protect
        if(!options.fields){
            this.options.fields = {};
            //use default names
            this.fields = {
                level : 'level',
                meta: 'metadata',
                method : 'method',
                endpoint : 'endpoint',
                req: 'req',
                responseCode : 'responsecode',
                res:'res',
                timestamp: 'timestamp',
                responseTime:'responsetime',
            }

        }else{
            //use custom table field names
            this.fields = {
                level : this.options.fields.level,
                meta: this.options.fields.meta,
                method : this.options.fields.method,
                endpoint : this.options.fields.endpoint,
                req: this.options.fields.req,
                responseCode : this.options.fields.responseCode,
                res:this.options.fields.res,
                timestamp: this.options.fields.timestamp,
                responseTime:this.options.fields.responseTime,
            }
        }

        const connOpts = {
            host: options.host,
            user: options.user,
            password: options.password,
            database: options.database
        }

        this.pool = MySql.createPool(connOpts);

    }

    /**
     * function log (info, callback)
     * {level, msg, [meta]} = info
     * @level {string} Level at which to log the message.
     * @msg {string} Message to log
     * @meta {Object} **Optional** Additional metadata to attach
     * @callback {function} Continuation to respond to when complete.
     * Core logging method exposed to Winston. Metadata is optional.
     */

    log(info, callback) {

        // get log content
        const { level, message, ...winstonMeta } = info;

        process.nextTick(() => {
            // protect
            if (!callback) {
                callback = () => {};
            }

            this.pool.getConnection((err, connection) => {
                if (err) {
                    // connect error
                    return callback(err, null);
                }

                // get data from message to store in object
                let messageSplitted = [];
                messageSplitted = message.split(" ");
                
                //set log object
                const log = {};
                log[this.fields.level] = level;
                log[this.fields.meta] = JSON.stringify(winstonMeta);
                log[this.fields.method] = messageSplitted[0];
                log[this.fields.endpoint] = messageSplitted[1];
                log[this.fields.req] = JSON.stringify(winstonMeta.meta.req);
                log[this.fields.responseCode] = messageSplitted[2];
                log[this.fields.res] = JSON.stringify(winstonMeta.meta.res);
                log[this.fields.timestamp] = winstonMeta.timestamp;
                log[this.fields.responseTime] = winstonMeta.meta.responseTime;

                //Save the log
                connection.query(
                    `INSERT INTO ${this.options.table} SET ?`,
                    log,
                    (err, results, fields) => {
                        if(err){
                            setImmediate(() => {
                                this.emit('error', err);
                            });
                            return callback(err, null);
                        }
                        //finished
                        connection.release();
                        setImmediate(() => {
                            this.emit('logged', info);
                        });

                        callback(null, true);
                    }
                );

            });

        });
    }
};
