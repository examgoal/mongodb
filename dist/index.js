"use strict";
const mongodb_1 = require("mongodb");
const instances = {};
class MongodbClient {
    constructor(config) {
        this.configuration = config;
        this.mongoClient = new mongodb_1.MongoClient(config.uri, Object.assign(Object.assign({}, (config.mongodbOptions || {})), { useNewUrlParser: true }));
        instances[config.name || '[DEFAULT]'] = this;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.mongoClient.connect((err) => {
                if (err) {
                    return reject(err);
                }
                if (this.configuration.logEnabled) {
                    console.log(`${this.name} App's MongoDB Connected`);
                }
                return resolve(instances[this.name]);
            });
        });
    }
    createSession() {
        if (!this.isConnected) {
            throw new Error(`${this.name} Can't create session if client is not connected`);
        }
        return this.mongoClient.startSession();
    }
    get db() {
        return this.mongoClient.db(this.configuration.db);
    }
    get isConnected() {
        return this.mongoClient.isConnected();
    }
    get client() {
        return this.mongoClient;
    }
    get name() {
        return this.configuration.name || '[DEFAULT]';
    }
    static async initializeApp(config) {
        try {
            let a = new MongodbClient(config);
            await a.connect();
        }
        catch (e) {
            throw new Error(`${this.name} MongoDB App\'s Error Occurred on first initialization ${e.toString()}`);
        }
    }
    static getInstance(name) {
        if (!instances.hasOwnProperty(name || '[DEFAULT]')) {
            throw new Error((name || '[DEFAULT]') + " MongoDB App is not found");
        }
        return instances[name];
    }
}
module.exports = MongodbClient;
