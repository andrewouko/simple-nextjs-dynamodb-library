import { UseToastOptions } from "@chakra-ui/react";
import { ISBNIndex, Users } from "@lib/constants";
import { getBookByBookID, queryLibraryTable } from "@lib/db/crud";
import {
  AttributeValuesType,
  Book,
  BookID,
  BookIDSchema,
  BorrowingStatus,
  ContextValue,
  ErrorResponse,
  ErrorStatusCodes,
  ErrorTypes,
  StatusCodes,
  SuccessResponse,
  SuccessStatusCodes,
} from "@lib/types";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React from "react";
import { SafeParseReturnType } from "zod";

function isError<T>(payload: ErrorTypes | T): payload is ErrorTypes {
  return (
    typeof (payload as ErrorTypes) === "string" ||
    (Array.isArray(payload) &&
      payload.length > 0 &&
      payload[0].code !== undefined)
  );
}

function formatResponse<T>(
  status: StatusCodes,
  payload: T | ErrorTypes
): SuccessResponse<T> | ErrorResponse {
  if (isError(payload))
    return {
      status: status as ErrorStatusCodes,
      error: payload,
    };
  return {
    status: status as SuccessStatusCodes,
    data: payload,
  };
}

export function jsonResponse<T>(
  status: StatusCodes,
  payload: T | ErrorTypes
): Response {
  const formatted_response = formatResponse(status, payload);
  const responseBody = JSON.stringify(formatted_response);
  const response = new Response(responseBody, {
    status: formatted_response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export const useContextSafely = <T>(new_context: React.Context<T>) => {
  const context = React.useContext(new_context);
  if (context === undefined) {
    throw new Error(`useContextSafely must be used within a Provider`);
  }
  return context;
};

export const formatRequestBody = async <T>(
  req: Request
): Promise<Response | T> => {
  let request_body: T;
  try {
    if (req.url === undefined) throw new Error("Request url is undefined");
    request_body = (await req.json()) as T;
    return request_body;
  } catch (err) {
    return jsonResponse(400, `Invalid Request. Kindly provide a body`);
  }
};

export function mapDataToBook(data: AttributeValuesType): Book {
  if (data === undefined)
    throw new Error(`Data cannot be undefined for conversion to Book type`);
  if (
    !data.BookID ||
    !data.ISBN ||
    !data.BorrowingStatus ||
    !data.Title ||
    !data.Author ||
    !data.ImageURL
  )
    throw new Error(
      `All properties of the book object must be present in the data object`
    );
  if (
    !data.BookID.S ||
    !data.ISBN.S ||
    !data.BorrowingStatus.S ||
    !data.Title.S ||
    !data.Author.S ||
    !data.ImageURL.S
  )
    throw new Error(
      `All string properties of the book object must be present in the data object`
    );
  const book: Book = {
    BookID: data.BookID.S,
    ISBN: data.ISBN.S,
    BorrowingStatus: data.BorrowingStatus.S as BorrowingStatus,
    Title: data.Title.S,
    Author: data.Author.S,
    ImageURL: data.ImageURL.S,
  };
  if (data.BorrowedRecord !== undefined) {
    if (data.BorrowedRecord.M === undefined)
      throw new Error(
        `All map properties of the BorrowedRecord property in the book object must be present`
      );
    book.BorrowedRecord = {
      BorrowerID: data.BorrowedRecord.M.BorrowerID.S ?? "",
      BorrowedDate: new Date(data.BorrowedRecord.M.BorrowedDate.S ?? ""),
      ReturnDate: new Date(data.BorrowedRecord.M.ReturnDate.S ?? ""),
    };
  }

  return book;
}

// check if book exists based on IDs provided
export const isBookExist = async (
  ISBN: string,
  BookID?: string
): Promise<Book | undefined> => {
  if (BookID === undefined) {
    // check if book exists based on ISBN only
    const result = await queryLibraryTable(ISBN, "ISBN", ISBNIndex);
    if (result && result.length > 0) {
      return result[0];
    }
    return;
  }
  // check if book exists based on BookID and ISBN
  const result = await getBookByBookID(BookID, ISBN);
  if (result !== undefined) {
    return result;
  }
  return;
};

// Not found response
export const formatNotFoundResponse = (BookID: string, ISBN: string) =>
  jsonResponse<string>(
    ErrorStatusCodes.NOT_FOUND,
    `Book with ID: ${BookID} and ISBN: ${ISBN} not found`
  );

export function createContext<T>() {
  return React.createContext<ContextValue<T> | undefined>(undefined);
}

export function getUser(userId: string) {
  return Users.find((user) => user.id === userId);
}

function formatQueryError(error: FetchBaseQueryError | SerializedError): string{
  let msg = 'An error ocurred';
  if ('status' in error) {
    // you can access all properties of `FetchBaseQueryError` here
    msg = error.data ? JSON.stringify(error.data) : msg
  }
  try{
    msg = JSON.stringify(JSON.parse(msg).error)
  } catch(err: any){}
  return msg
}

export function getQueryErrorToastOptions(title: string, error: FetchBaseQueryError | SerializedError): UseToastOptions{
  return {
    title: title,
    description: `${error && formatQueryError(error)}`,
    status: "error",
    duration: 5000,
    isClosable: true,
  }
}
