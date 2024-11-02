const { MongoClient } = require("mongodb");

// Connection URL
const URI =
  "mongodb+srv://Rama7993:k1hwY4svZouDsAm8@nodejs-practise.wtxno.mongodb.net/";
const client = new MongoClient(URI);

// Database Name
const dbName = "NodeJs_Practise";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection("documents");
  const findResult = await collection.find({}).toArray();
  console.log("Found documents =>", findResult);
  return "done.";
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());
