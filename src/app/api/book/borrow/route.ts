import { deleteBorrowedRecordFromBook, updateBorrowedRecordToBook } from "@lib/db/crud";
import {
    Book,
    BookID,
    Borrow,
    BorrowSchema,
    BorrowedRecord,
    ErrorStatusCodes,
    SuccessStatusCodes,
} from "@lib/types";
import {
    formatNotFoundResponse,
    formatRequestBody,
    getUser,
    isBookExist,
    jsonResponse
} from "@lib/utils";
import { SafeParseReturnType } from "zod";

// Create a new borrowing
export async function PUT(req: Request): Promise<Response> {
  let request_body = await formatRequestBody<Borrow>(req);
  if (request_body instanceof Response) return request_body;
  const validation_result = validateRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }
  try {
    // check if book exists based on ID provided
    const current_book = await isBookExist(
      request_body.ISBN,
      request_body.BookID
    );
    if (current_book === undefined) {
      return formatNotFoundResponse(request_body.BookID, request_body.ISBN);
    }

    let BorrowedDate: Date;
    if (request_body.BorrowedDate === undefined) BorrowedDate = new Date();
    // assume date is passed as ISO 8601
    else BorrowedDate = new Date(request_body.BorrowedDate);

    let ReturnDate: Date;
    if (request_body.ReturnDate === undefined) {
      ReturnDate = new Date(BorrowedDate);
      ReturnDate.setDate(BorrowedDate.getDate() + 1);
    } else {
      // assume date is passed as ISO 8601
      ReturnDate = new Date(request_body.ReturnDate);
      if (ReturnDate <= BorrowedDate)
        return jsonResponse(
          ErrorStatusCodes.BAD_REQUEST,
          `The return date must greater than the current date`
        );
    }

    const newBorrowedRecord: BorrowedRecord = {
      BorrowerID: request_body.BorrowerID,
      BorrowedDate,
      ReturnDate,
    };
    const updated_book = await updateBorrowedRecordToBook(
      request_body.BookID,
      request_body.ISBN,
      newBorrowedRecord
    );
    return jsonResponse<Book>(SuccessStatusCodes.OK, updated_book);
  } catch (err) {
    let msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
}

// Delete a borrowing
export async function DELETE(req: Request): Promise<Response> {
  let request_body = await formatRequestBody<Borrow>(req);
  if (request_body instanceof Response) return request_body;

  // valdate the request
  const validation_result = validateRequest(request_body);
  if (!validation_result.success) {
    return jsonResponse(
      ErrorStatusCodes.BAD_REQUEST,
      JSON.parse(validation_result.error.message)
    );
  }

  try {
    // check if book exists based on ID provided
    const current_book = await isBookExist(
      request_body.ISBN,
      request_body.BookID
    );
    if (current_book === undefined) {
      return formatNotFoundResponse(request_body.BookID, request_body.ISBN);
    }

    // check that the current book has a BorrowRecord
    if(current_book.BorrowedRecord === undefined) return jsonResponse(ErrorStatusCodes.BAD_REQUEST, `The book has not been borrowed`);

    // check if the user returning the book
    // is the one that borrowed it
    const isSameUSer = current_book.BorrowedRecord && (current_book.BorrowedRecord.BorrowerID === request_body.BorrowerID)
    if(!isSameUSer) return jsonResponse(ErrorStatusCodes.BAD_REQUEST, `The user returning the book must same user. Currently borrowed by user: ${getUser(current_book.BorrowedRecord.BorrowerID)?.name || current_book.BorrowedRecord.BorrowerID}`);

    const updated_book = await deleteBorrowedRecordFromBook(
      request_body.BookID,
      request_body.ISBN
    );
    return jsonResponse<Book>(SuccessStatusCodes.OK, updated_book);
  } catch (err) {
    let msg = "Error performing operation on DynamoDB";
    console.error(msg, err);
    return jsonResponse(ErrorStatusCodes.INTERNAL_SERVER_ERROR, msg);
  }
}

const validateRequest = (
  request_body: Borrow
): SafeParseReturnType<Borrow, Borrow> => {
  return BorrowSchema.safeParse(request_body);
};
