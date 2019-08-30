import {ClientSession, Db, MongoClient} from 'mongodb'
import {ConfigOptions} from "./lib/options";

const instances: { [key: string]: MongodbClient } = {};

class MongodbClient{

    private readonly configuration: ConfigOptions;

    private readonly mongoClient: MongoClient;

    constructor(config: ConfigOptions){

        this.configuration = config;

        this.mongoClient = new MongoClient(config.uri, {...(config.mongodbOptions || {}), useNewUrlParser: true});

    }

    connect() : Promise<MongodbClient>{
        return new Promise(async (resolve, reject) => {

            this.mongoClient.connect((err)=>{

                if(err){

                    return reject(err);

                }
                if(this.configuration.logEnabled){

                    console.log(`${this.name} App's MongoDB Connected`);

                }

                return resolve(instances[this.name]);
            })
        });
    }

    createSession(): ClientSession {
        if(!this.isConnected){

            throw new Error(`${this.name} Can't create session if client is not connected`);

        }
        return this.mongoClient.startSession();
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

        let a = new MongodbClient(config);

        instances[config.name || '[DEFAULT]'] = a;

        a.connect().catch(err=> {

            throw new Error(`${a.name} MongoDB App\'s Error Occurred on first initialization ${err.toString()}`);

        });

    }

    static getInstance(name: string) : MongodbClient {
        if(!instances.hasOwnProperty(name || '[DEFAULT]')){

            throw new Error((name || '[DEFAULT]')+" MongoDB App is not found");

        }
        return instances[name];
    }
}

export = MongodbClient;


