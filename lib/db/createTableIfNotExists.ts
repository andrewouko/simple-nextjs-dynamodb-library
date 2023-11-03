import {
  AttributeDefinition,
  CreateTableCommand,
  CreateTableCommandInput,
  DescribeTableCommand,
  GlobalSecondaryIndex,
  KeySchemaElement,
} from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../config/dynamodb_config";

export const createTableIfNotExists = async (
  TableName: string,
  KeySchema: KeySchemaElement[],
  AttributeDefinitions: AttributeDefinition[],
  GlobalSecondaryIndexes: GlobalSecondaryIndex[] | undefined = undefined,
): Promise<boolean> => {
  // Check if the table already exists
  try {
    const describeTableCommand = new DescribeTableCommand({ TableName });
    await ddbClient.send(describeTableCommand);
    console.log(`DynamoDB table "${TableName}" already exists.`);
    return true;
  } catch (error: any) {
    // If the table does not exist, the DescribeTableCommand will throw an error
    if (error.name !== "ResourceNotFoundException") {
      const msg = `Error checking if DynamoDB table exists`;
      console.error(msg, error);
      throw new Error(msg);
    }
  }
  // create a new DynamoDB table
  const params: CreateTableCommandInput = {
    TableName,
    KeySchema,
    AttributeDefinitions,
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes
  };
  try {
    const command = new CreateTableCommand(params);
    await ddbClient.send(command);
    console.log(`DynamoDB table "${TableName}" created.`);
    return true;
  } catch (err: any) {
    const msg = `Error creating DynamoDB table "${TableName}"`;
    console.log(msg, err);
    throw new Error(msg);
  }
};
