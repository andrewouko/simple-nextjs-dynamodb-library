import { createContext } from "./utils";

export const UserContext = createContext<string>();

export const RefetchContext = createContext<() => void>();

export const AddBookContext = createContext<boolean>();
