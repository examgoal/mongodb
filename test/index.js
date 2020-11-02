const Mongodb = require("mongodb").MongoClient;

const client = new Mongodb(process.env.MONGODB_URI || 'mongodb://localhost:27017/examgoal', {
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
    client.removeListener("serverClosed", () => {})
    clientConnected();
    console.log(event);
});

(async () => {

    clientConnected();

    await client.connect();

    const db = client.db("examgoal");

    await client.close(true)

    const f = () => {
        clientConnected();
        db.listCollections().toArray().then(() => setTimeout(f, 1000)).catch((e) => {
            console.error(e);
            setTimeout(f, 1000);
        });
    }

    f();

})().catch(console.error);