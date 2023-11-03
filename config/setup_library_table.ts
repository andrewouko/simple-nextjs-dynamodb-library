import {
  AttributeDefinition,
  KeySchemaElement,
  ScalarAttributeType,
  GlobalSecondaryIndex,
  ProjectionType,
} from "@aws-sdk/client-dynamodb";
import { createTableIfNotExists } from "../lib/db/createTableIfNotExists";
import { AuthorIndex, BorrowingStatusIndex, ISBNIndex, ImageURLIndex, TableName, TitleIndex } from "../lib/constants";

// Define the Key Schema
const keySchema: KeySchemaElement[] = [
  { AttributeName: "BookID", KeyType: "HASH" }, // Primary Key
  { AttributeName: "ISBN", KeyType: "RANGE" }, // sort key
];

// Define the Attribute Definitions
const attributeDefinitions: AttributeDefinition[] = [
  { AttributeName: "BookID", AttributeType: ScalarAttributeType.S },
  { AttributeName: "ISBN", AttributeType: ScalarAttributeType.S },
  { AttributeName: "Title", AttributeType: ScalarAttributeType.S },
  { AttributeName: "Author", AttributeType: ScalarAttributeType.S },
  { AttributeName: "BorrowingStatus", AttributeType: ScalarAttributeType.S },
  { AttributeName: "ImageURL", AttributeType: ScalarAttributeType.S },
  // { AttributeName: "BorrowedRecord", AttributeType: ScalarAttributeType.L }, // Use L for lists
];

// Define the Global Secondary Index (GSI)
const globalSecondaryIndexes: GlobalSecondaryIndex[] = [
  // for querying by Isbn
  {
    IndexName: ISBNIndex,
    KeySchema: [
      { AttributeName: "ISBN", KeyType: "HASH" }, // partition key
      { AttributeName: "BookID", KeyType: "RANGE" }, // sort key
    ],
    Projection: {
      ProjectionType: ProjectionType.ALL,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  // for querying by title
  {
    IndexName: TitleIndex,
    KeySchema: [
      { AttributeName: "Title", KeyType: "HASH" }, // partition key
      { AttributeName: "BookID", KeyType: "RANGE" }, // sort key
    ],
    Projection: {
      ProjectionType: ProjectionType.ALL,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  // for querying by author
  {
    IndexName: AuthorIndex,
    KeySchema: [
      { AttributeName: "Author", KeyType: "HASH" }, // partition key
      { AttributeName: "BookID", KeyType: "RANGE" }, // sort key
    ],
    Projection: {
      ProjectionType: ProjectionType.ALL,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  // for querying by borrowing status
  {
    IndexName: BorrowingStatusIndex,
    KeySchema: [
      { AttributeName: "BorrowingStatus", KeyType: "HASH" }, // partition key
      { AttributeName: "BookID", KeyType: "RANGE" }, // sort key
    ],
    Projection: {
      ProjectionType: ProjectionType.ALL,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  // for querying by image
  {
    IndexName: ImageURLIndex,
    KeySchema: [
      { AttributeName: "ImageURL", KeyType: "HASH" }, // partition key
      { AttributeName: "BookID", KeyType: "RANGE" }, // sort key
    ],
    Projection: {
      ProjectionType: ProjectionType.ALL,
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
];

async function setupLibraryTable() {
  try {
    // create Library Dynamodb table if not exits
    await createTableIfNotExists(
      TableName,
      keySchema,
      attributeDefinitions,
      globalSecondaryIndexes
    );
  } catch (e) {
    console.error(`Unable to setup ${TableName} table`, e);
  }
}

setupLibraryTable();
