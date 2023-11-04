import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { z } from "zod";

/**
 * ISBN 10 or 13 regex 
 * 
^
(?:ISBN(?:-10)?:?\ )?     # Optional ISBN/ISBN-10 identifier.
(?=                       # Basic format pre-checks (lookahead):
  [0-9X]{10}$             #   Require 10 digits/Xs (no separators).
 |                        #  Or:
  (?=(?:[0-9]+[-\ ]){3})  #   Require 3 separators
  [-\ 0-9X]{13}$          #     out of 13 characters total.
)                         # End format pre-checks.
[0-9]{1,5}[-\ ]?          # 1-5 digit group identifier.
[0-9]+[-\ ]?[0-9]+[-\ ]?  # Publisher and title identifiers.
[0-9X]                    # Check digit.
$ */
const isbn_regex = new RegExp(
  `^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$`,
  "g"
);

export enum BorrowingStatus {
  Available = "Available",
  CheckedOut = "Checked Out",
}

const user_regex = new RegExp(`^user\\d{1,}$`, "g");

const user_prop_type = z.string().regex(user_regex);

export const isbn_prop_type = z.string().regex(isbn_regex);

export const borrowing_status_prop_type = z.nativeEnum(BorrowingStatus);

const BorrowedRecordchema = z.object({
  BorrowerID: user_prop_type,
  BorrowedDate: z.date(),
  ReturnDate: z.date(),
});

export type BorrowedRecord = z.infer<typeof BorrowedRecordchema>;

export const BookIDSchema = z.object({
  BookID: z.string().uuid(),
  ISBN: isbn_prop_type,
});

export type BookID = z.infer<typeof BookIDSchema>;

export const BorrowSchema = BookIDSchema.merge(
  z.object({
    BorrowerID: user_prop_type,
    BorrowedDate: z.date().optional(),
    ReturnDate: z.date().optional(),
  })
);

export type Borrow = z.infer<typeof BorrowSchema>;

export const BookSchema = BookIDSchema.merge(
  z.object({
    Title: z.string(),
    Author: z.string(),
    BorrowedRecord: BorrowedRecordchema.optional(),
    BorrowingStatus: borrowing_status_prop_type,
    ImageURL: z.string().url(),
  })
);

export type Book = z.infer<typeof BookSchema>;

export enum ErrorStatusCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
export enum SuccessStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,
}
export type StatusCodes = ErrorStatusCodes | SuccessStatusCodes;
export type ValidationError = Array<{
  code: string;
  expected: string;
  received: string;
  path: Array<string>;
  message: string;
}>;
export type ErrorTypes = ValidationError | string;
export type ErrorResponse = {
  status: ErrorStatusCodes;
  error: ErrorTypes;
};
export type SuccessResponse<T> = {
  status: SuccessStatusCodes;
  data: T;
};
export type UpdateBook = Omit<Book, "BorrowedRecord">;
export const GetBookSchema = z.object({
  ISBN: isbn_prop_type.optional(),
  Title: z.string().optional(),
  Author: z.string().optional(),
  BorrowingStatus: borrowing_status_prop_type.optional(),
});
export type GetBook = z.infer<typeof GetBookSchema>;

export type AttributeValuesType = Record<string, AttributeValue> | undefined;

export type User = {
  name: string;
  image_url: string;
  id: string;
};

export type ContextValue<T> = {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
};
