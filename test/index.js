const Mongodb = require("mongodb").MongoClient;

const client = new Mongodb(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 1000,
    bufferMaxEntries: 10
});

const clientConnected = () => {
    console.log("Client is Connected:", client.isConnected())
}

client.on('serverClosed', async function (event) {
    console.log('received serverClosed');
    clientConnected();
    console.log(event);
});

(async () => {

    clientConnected();

    await client.connect();

    const db = client.db("examgoal");

    const f = () => {
        clientConnected();
        db.listCollections().toArray().then(() => setTimeout(f, 1000)).catch((e) => {
            console.error(e);
            setTimeout(f, 1000);
        });
    }

    f();

})().catch(console.error);