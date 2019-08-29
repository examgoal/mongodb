import {MongoClientOptions} from "mongodb";

export interface ConfigOptions {
    uri: string,
    db: string,
    mongodbOptions?: MongoClientOptions,
    name?: string,
    logEnabled: boolean
}