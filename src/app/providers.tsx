"use client";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { AddBookContext, UserContext } from "@lib/contexts";
import { store } from "@lib/redux/store";
import React, { useState } from "react";
import { Provider } from "react-redux";

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  const [user, setUser] = useState<string>("");
  const [addBook, setAddBook] = useState<boolean>(false);
  return (
    <CacheProvider>
      <ChakraProvider>
        <Provider store={store}>
          <UserContext.Provider value={{ data: user, setData: setUser }}>
            <AddBookContext.Provider
              value={{ data: addBook, setData: setAddBook }}
            >
              {children}
            </AddBookContext.Provider>
          </UserContext.Provider>
        </Provider>
      </ChakraProvider>
    </CacheProvider>
  );
}
