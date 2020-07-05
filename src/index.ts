import {Db, MongoClient} from 'mongodb'
import {ConfigOptions} from "./lib/options";

const instances: { [key: string]: MongodbClient } = {};

class MongodbClient {

    private readonly configuration: ConfigOptions;

    private mongoClient: MongoClient;

    private isConnected: boolean = false;

    constructor(config: ConfigOptions) {
        this.configuration = config;
        this.mongoClient = new MongoClient(config.uri, config.mongodbOptions || {});
        this.mongoClient.on("serverClosed", this.resetClient);
    }

    private resetClient() {
        this.mongoClient.removeListener("serverClosed", this.resetClient);
        this.mongoClient = new MongoClient(this.configuration.uri, this.configuration.mongodbOptions || {});
        this.mongoClient.on("serverClosed", this.resetClient);
        this.isConnected = false;
    }

    getDb(name?: string): Promise<Db> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                return resolve(this.mongoClient.db(name || this.configuration.db));
            }
            this.mongoClient.connect()
                .then(res => {
                    if (this.configuration.logEnabled) {
                        console.log(`${this.name} Mongodb Connection Established`);
                    }
                    this.isConnected = true;
                    return resolve(res.db(name || this.configuration.db));
                })
                .catch(err => {
                    this.isConnected = false;
                    reject(err);
                });
        });
    }

    get client(): MongoClient {
        return this.mongoClient;
    }

    get name() {
        return this.configuration.name || '[DEFAULT]';
    }

    static initializeApp(config: ConfigOptions) {

        instances[config.name || '[DEFAULT]'] = new MongodbClient(config);

    }

    static getInstance(name?: string): MongodbClient {
        if (!instances.hasOwnProperty(name || '[DEFAULT]')) {

            throw new Error((name || '[DEFAULT]') + " MongoDB App is not found");

        }
        return instances[name || '[DEFAULT]'];
    }
}

export = MongodbClient;


