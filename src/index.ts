import {ClientSession, Db, MongoClient} from 'mongodb'
import {ConfigOptions} from "./lib/options";

const instances: { [key: string]: MongodbClient } = {};

class MongodbClient{

    private readonly configuration: ConfigOptions;

    private readonly mongoClient: MongoClient;

    constructor(config: ConfigOptions){

        this.configuration = config;

        this.mongoClient = new MongoClient(config.uri, {...(config.mongodbOptions || {}), numberOfRetries: Number.MAX_VALUE, useNewUrlParser: true, useUnifiedTopology: true});

    }

    createSession(): ClientSession {
        if(!this.isConnected){

            throw new Error(`${this.name} Can't create session if client is not connected`);

        }
        return this.mongoClient.startSession();
    }

    getDb(name?: string): Promise<Db>{
       return new Promise((resolve, reject) => {
             if(this.isConnected){
                 return resolve(this.mongoClient.db(name || this.configuration.db));
             }
             this.mongoClient.connect()
                 .then(res=> resolve(res.db(name || this.configuration.db)))
                 .catch(reject);
       });
    }

    get db(): Db {
        return this.mongoClient.db(this.configuration.db);
    }

    get isConnected(): boolean{
        return this.mongoClient.isConnected();
    }

    get client() : MongoClient{
        return this.mongoClient;
    }

    get name(){
        return this.configuration.name || '[DEFAULT]';
    }

    static initializeApp(config: ConfigOptions){

        instances[config.name || '[DEFAULT]'] = new MongodbClient(config);

    }

    static getInstance(name?: string) : MongodbClient {
        if(!instances.hasOwnProperty(name || '[DEFAULT]')){

            throw new Error((name || '[DEFAULT]')+" MongoDB App is not found");

        }
        return instances[name || '[DEFAULT]'];
    }
}

export = MongodbClient;


