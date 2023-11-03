import {
    AuthorIndex,
    BorrowingStatusIndex,
    ISBNIndex,
    TitleIndex,
} from "@lib/constants";
import {
    deleteBookByBookID,
    getAllItemsFromLibraryTable,
    insertNewBook,
    queryLibraryTable,
    updateBook
} from "@lib/db/crud";
import {
    Book,
    BookID,
    BookSchema,
    BorrowingStatus,
    ErrorStatusCodes,
    GetBook,
    GetBookSchema,
    SuccessStatusCodes,
    UpdateBook
} from "@lib/types";
import { formatNotFoundResponse, formatRequestBody, isBookExist, jsonResponse, validateDeleteRequest } from "@lib/utils";
import { v4 as uuidv4 } from "uuid";
import { SafeParseReturnType } from "zod";

// create new Book in Library
export async function POST(req: Request): Promise<Response> {
  let request_body = await formatRequestBody<Book>(req);
  if (request_body instanceof Response) return request_body;

  // valdate the request
  request_body.BookID = uuidv4();
  request_body.BorrowingStatus = BorrowingStatus.Available;
  const validation_result = validatePostRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }

  try {
    // check if book exists based on isbn provided
    const current_book = await isBookExist(request_body.ISBN)
    if (current_book !== undefined) {
      // return found book to make endpoint idempotent
      return jsonResponse<Book>(SuccessStatusCodes.OK, current_book);
    }

    // insert new book
    await insertNewBook(request_body);
    return jsonResponse<Book>(SuccessStatusCodes.CREATED, request_body);
  } catch (err) {
    const msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
}
// Update a Book's details
export async function PUT(req: Request): Promise<Response> {
  let request_body = await formatRequestBody<Book>(req);
  if (request_body instanceof Response) return request_body;

  // valdate the request
  const validation_result = validatePostRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }

  try {
    // check if book exists based on ID provided
    const current_book = await isBookExist(request_body.ISBN, request_body.BookID)
    if (current_book === undefined) {
      return formatNotFoundResponse(request_body.BookID, request_body.ISBN);
    }

    // update borrowing status accordingly
    let borrowingStatus: BorrowingStatus = BorrowingStatus.Available;
    if (current_book.BorrowedRecord !== undefined) {
      borrowingStatus = BorrowingStatus.CheckedOut;
    }

    const attributesToUpdate: UpdateBook = {
      BookID: request_body.BookID,
      ISBN: request_body.ISBN,
      Title: request_body.Title,
      Author: request_body.Author,
      BorrowingStatus: borrowingStatus,
      ImageURL: request_body.ImageURL,
    };

    const updated_book = await updateBook<UpdateBook>(
      request_body.BookID,
      request_body.ISBN,
      attributesToUpdate
    );
    return jsonResponse<Book>(SuccessStatusCodes.OK, updated_book);
  } catch (err) {
    const msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
}
// Delete a Book
export async function DELETE(req: Request): Promise<Response> {
  let request_body = await formatRequestBody<BookID>(req);
  if (request_body instanceof Response) return request_body;

  // valdate the request
  const validation_result = validateDeleteRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }

  try {
    // check if book exists based on ID provided
    const current_book = await isBookExist(request_body.ISBN, request_body.BookID)
    if (current_book === undefined) {
      return formatNotFoundResponse(request_body.BookID, request_body.ISBN);
    }

    // delete book
    await deleteBookByBookID(request_body);
    return jsonResponse<Book>(SuccessStatusCodes.OK, current_book);
  } catch (err) {
    const msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
}
// Get Books
export async function GET(req: Request): Promise<Response> {
  if (req.url === undefined) throw new Error("Request url is undefined");
  const request_body = Object.fromEntries(
    new URL(req.url).searchParams
  ) as unknown as GetBook;

  const validation_result = validateGetRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }
  
  let results: Book[] = [];

  const queryAndAddToResults = async (
    IndexName: string,
    value: string,
    attribute: keyof Omit<Book, "BorrowedRecord">
  ): Promise<void> => {
    let result = await queryLibraryTable(value, attribute, IndexName);
    if (result && result.length > 0) {
      result = result.filter((book: Book) => {
        const existing = results.find((b: Book) => b.BookID === book.BookID);
        return existing === undefined;
      });
      if (result.length > 0) results.push(...result);
    }
  };
  try {
    if (request_body.Author) {
      await queryAndAddToResults(AuthorIndex, request_body.Author, "Author");
    }
    if (request_body.BorrowingStatus) {
      await queryAndAddToResults(
        BorrowingStatusIndex,
        request_body.BorrowingStatus,
        "BorrowingStatus"
      );
    }
    if (request_body.ISBN) {
      await queryAndAddToResults(ISBNIndex, request_body.ISBN, "ISBN");
    }
    if (request_body.Title) {
      await queryAndAddToResults(TitleIndex, request_body.Title, "Title");
    }
    // get all books from table
    if (Object.keys(request_body).length < 1) {
      const result = await getAllItemsFromLibraryTable();
      if (result && result.length > 0) {
        results.push(...result);
      }
    }
  } catch (err) {
    const msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
  return jsonResponse<Book[]>(SuccessStatusCodes.OK, results);
}

const validatePostRequest = (
  request_body: Book
): SafeParseReturnType<Book, Book> => {
  return BookSchema.safeParse(request_body);
};

const validateGetRequest = (
  request_body: GetBook
): SafeParseReturnType<GetBook, GetBook> => {
  return GetBookSchema.safeParse(request_body);
};
