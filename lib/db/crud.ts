import {
  AttributeValue,
  DeleteItemCommand,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "@config/dynamodb_config";
import { TableName } from "@lib/constants";
import { Book, BookID, BorrowedRecord, BorrowingStatus } from "@lib/types";
import { mapDataToBook } from "@lib/utils";

// insert new Book
export async function insertNewBook(book: Book): Promise<Book> {
  // Prepare the item for insertion
  const item: PutItemCommandInput = {
    TableName,
    Item: {
      BookID: { S: book.BookID },
      Title: { S: book.Title },
      Author: { S: book.Author },
      ISBN: { S: book.ISBN },
      BorrowingStatus: { S: book.BorrowingStatus },
      ImageURL: { S: book.ImageURL },
    },
    ReturnValues: "ALL_OLD",
  };

  // Insert the item into DynamoDB
  await ddbClient.send(new PutItemCommand(item));

  const result = await getBookByBookID(book.BookID, book.ISBN)
  if(result === undefined) throw new Error(`Insertion to DynamoDB failed`);
  return result;
}

// function to query Books based on a GSI
export async function queryLibraryTable(
  value: string,
  attribute: keyof Omit<Book, "BorrowedRecord">,
  IndexName: string
): Promise<Book[]> {
  const KeyConditionExpression = `${attribute} = :${attribute.toLowerCase()}`;

  const ExpressionAttributeValues = {
    [`:${attribute.toLowerCase()}`]: { S: value },
  };

  // Create a `ProjectionExpression` to include all attributes
  const ProjectionExpression =
    "BookID, ISBN, Title, Author, ImageURL, BorrowedRecord, BorrowingStatus";

  const queryCommand = new QueryCommand({
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeValues,
    ProjectionExpression,
  });

  const result = await ddbClient.send(queryCommand);

  if (result.Items === undefined) result.Items = [];

  return result.Items.map((item) => mapDataToBook(item));
}

// fetch Book by ID (primary key) and ISBN (sort key)
export async function getBookByBookID(
  BookID: string,
  ISBN: string
): Promise<Book | undefined> {
  const getItemParams: GetItemCommandInput = {
    TableName,
    Key: marshall({ BookID, ISBN }),
  };

  const result = await ddbClient.send(new GetItemCommand(getItemParams));

  if (result.Item === undefined) return undefined;

  return mapDataToBook(result.Item);
}

// function to update fields dynamically by ID (primary key) and ISBN (sort key)
export async function updateBook<T extends Record<string, string>>(
  BookID: string,
  ISBN: string,
  attributes: T
): Promise<Book> {
  // keys to use for the update operation
  // filter out the attributes that are part of the key
  const keys = Object.keys(attributes).filter(
    (attribute: string) => !["BookID", "ISBN"].includes(attribute)
  );

  const UpdateExpression: string =
    `set ` +
    keys
      .map((attribute) => `${attribute} = :${attribute.toLowerCase()}`)
      .join(`, `);

  const ExpressionAttributeNames: Record<string, string> = keys.reduce(
    (acc, attribute) => ({
      ...acc,
      [`#${attribute}`]: attribute,
    }),
    {}
  );

  const ExpressionAttributeValues: Record<string, AttributeValue> = keys.reduce(
    (acc, attribute) => ({
      ...acc,
      [`:${attribute.toLowerCase()}`]: marshall(attributes[attribute]),
    }),
    {}
  );

  //   console.log(UpdateExpression, ExpressionAttributeValues);

  const updateItemParams: UpdateItemCommandInput = {
    TableName,
    Key: marshall({ BookID, ISBN }),
    UpdateExpression,
    // ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await ddbClient.send(new UpdateItemCommand(updateItemParams));
  return mapDataToBook(result.Attributes);
}

// delete Book by ID (primary key) and ISBN (sort key)
export async function deleteBookByBookID(request_body: BookID): Promise<void> {
  const getItemParams: GetItemCommandInput = {
    TableName,
    Key: marshall(request_body),
  };

  await ddbClient.send(new DeleteItemCommand(getItemParams));
}

// get all items in library table
export async function getAllItemsFromLibraryTable(): Promise<Book[]> {
  const scanCommand = new ScanCommand({
    TableName,
  });

  const result = await ddbClient.send(scanCommand);

  if (result.Items === undefined) result.Items = [];

  return result.Items.map((item) => mapDataToBook(item));
}

// add a BorrowedRecord to a Book
export async function updateBorrowedRecordToBook(
  BookID: string,
  ISBN: string,
  newBorrowedRecord: BorrowedRecord
): Promise<Book> {
  const updateItemParams: UpdateItemCommandInput = {
    TableName,
    Key: marshall({ BookID, ISBN }),
    UpdateExpression:
      "SET BorrowedRecord = :record, BorrowingStatus = :borrowingStatus",
    ExpressionAttributeValues: {
      ":record": {
        M: {
          BorrowerID: { S: newBorrowedRecord.BorrowerID },
          BorrowedDate: { S: newBorrowedRecord.BorrowedDate.toISOString() },
          ReturnDate: { S: newBorrowedRecord.ReturnDate.toISOString() },
        },
      },
      ":borrowingStatus": { S: BorrowingStatus.CheckedOut },
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await ddbClient.send(new UpdateItemCommand(updateItemParams));

  return mapDataToBook(result.Attributes);
}

// delete a BorrowedRecord from Book
export async function deleteBorrowedRecordFromBook(
  BookID: string,
  ISBN: string
): Promise<Book> {
  const updateItemParams: UpdateItemCommandInput = {
    TableName,
    Key: marshall({ BookID, ISBN }),
    UpdateExpression:
      "REMOVE BorrowedRecord SET BorrowingStatus = :borrowingStatus",
    ExpressionAttributeValues: {
      ":borrowingStatus": { S: BorrowingStatus.Available },
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await ddbClient.send(new UpdateItemCommand(updateItemParams));

  return mapDataToBook(result.Attributes);
}
