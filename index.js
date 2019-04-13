const m = require('mongodb');

let instances = {};

module.exports = class MonClient {

    constructor(config){

        this.configuration = config;

        this.mongoClient = null;

        instances[config.name || '[DEFAULT]'] = this;
    }

    connect(){
        return new Promise(async (resolve, reject) => {

            let c = this.configuration;

            let client = m.MongoClient(c.uri, {...(c.options || {}), useNewUrlParser: true});

            try {

                await client.connect();

                if(this.configuration.logEnabled || false){

                  console.log((c.name || '[DEFAULT]')+" App's MongoDB Connected");

                }

                this.mongoClient = client;

                return resolve(instances[c.name || '[DEFAULT]']);

            }catch (e) {

                return reject(e);

            }
        });
    }

    get client(){
        return this.mongoClient;
    }

    get db(){
        return this.mongoClient ? this.mongoClient.db(this.configuration.db) : null;
    }

    get isConnected(){
        return this.mongoClient != null;
    }

    static async initializeApp(config){

        try {

          let a = new MonClient(config);

          await a.connect();

        }catch (e) {

            throw new Error((config.name || '[DEFAULT]')+' MongoDB App\'s Error Occurred on first initialization '+e.toString());

        }
    }

    static getInstance(name){

        if(!instances.hasOwnProperty(name || '[DEFAULT]')){

            throw new Error((name || '[DEFAULT]')+" MongoDB App is not found");
        }

        return instances[name || '[DEFAULT]'];


    }
};
