import { MongoClient, MongoClientOptions, Db } from "mongodb";

const options: MongoClientOptions = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri() {
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Falta la variable de entorno "MONGO_URI"');
  }

  return uri;
}

export function getDbName() {
  return process.env.MONGODB_DB || "AVGCONNECTS";
}

export function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(getUri(), options).connect();
  }

  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(getDbName());
}
