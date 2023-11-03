// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'localhost',
  endpoint: process.env.AWS_DYNAMODB_ENDPOINT || `http://localhost:${process.env.AWS_DYNAMODB_PORT}`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'None',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'None',
  },
});

export { ddbClient };