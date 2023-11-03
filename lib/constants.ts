import sample_users from "@lib/mocks/users.json";
import { User } from "./types";

export const TableName = "Library";

export const ISBNIndex = "ISBNIndex";

export const TitleIndex = "TitleIndex";

export const AuthorIndex = "AuthorIndex";

export const BorrowingStatusIndex = "BorrowingStatusIndex";

export const ImageURLIndex = "ImageURLIndex";

export const APP_TITLE = "Simple Library";

export const APP_DESC = "A simple library application";

export const Users: User[] = sample_users;
