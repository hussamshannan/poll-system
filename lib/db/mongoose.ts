import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "poll-app",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  // One-time migration: drop obsolete voterName unique index if it still exists
  await cached.conn.connection.db
    ?.collection("votes")
    .dropIndex("pollId_1_voterName_1")
    .catch(() => { /* index already absent — ignore */ });

  return cached.conn;
}
