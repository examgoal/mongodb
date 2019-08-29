import {ClientSession, Db, MongoClient, MongoClientOptions} from 'mongodb'

const instances: { [key: string]: MongodbClient } = {};

export interface ConfigOptions {
    uri: string,
    db: string,
    mongodbOptions?: MongoClientOptions,
    name?: string,
    logEnabled: boolean
}

class MongodbClient{

    private readonly configuration: ConfigOptions;

    private mongoClient?: MongoClient;

    constructor(config: ConfigOptions){

        this.configuration = config;

        instances[config.name || '[DEFAULT]'] = this;
    }

    connect() : Promise<MongodbClient>{
        return new Promise(async (resolve, reject) => {

            let c = this.configuration;

            let client = new MongoClient(c.uri, {...(c.mongodbOptions || {}), useNewUrlParser: true});

            client.connect((err, res)=>{

                if(err){

                    return reject(err);

                }
                if(this.configuration.logEnabled){

                    console.log(`${this.name} App's MongoDB Connected`);

                }

                this.mongoClient = res;

                return resolve(instances[this.name]);
            })
        });
    }

    createSession(): ClientSession {
        if(!this.mongoClient){

            throw new Error(`${this.name} Can't create session if client is not connected`);

        }
        return this.mongoClient.startSession();
    }

    get db(): Db | undefined{
        return this.mongoClient ? this.mongoClient.db(this.configuration.db) : undefined;
    }

    get isConnected(): boolean{
        return this.mongoClient != null;
    }

    get client() : MongoClient | undefined {
        return this.mongoClient;
    }

    get name(){
        return this.configuration.name || '[DEFAULT]';
    }

    static async initializeApp(config: ConfigOptions){

        try {

            let a = new MongodbClient(config);

            await a.connect();

        }catch (e) {

            throw new Error(`${this.name} MongoDB App\'s Error Occurred on first initialization ${e.toString()}`);

        }
    }

    static getInstance(name: string) : MongodbClient {
        if(!instances.hasOwnProperty(name || '[DEFAULT]')){

            throw new Error((name || '[DEFAULT]')+" MongoDB App is not found");

        }
        return instances[name];
    }
}

export default MongodbClient;


