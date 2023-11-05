import { setupServer } from "msw/node";

import { fetch, Headers, Request, Response } from "cross-fetch";

import { loadEnvConfig } from '@next/env';

import '@testing-library/jest-dom/extend-expect'
import { Book, BorrowingStatus, SuccessResponse, SuccessStatusCodes } from "@lib/types";

import get_books_200 from "@mocks/200-get-books.json";
import { rest } from "msw";

import {randomUUID} from 'node:crypto';


// mock crypto randomUUID generatorfunc
window.crypto.randomUUID = randomUUID;

// mock the matchMedia func
const matchMediaMock = (query: string) => {
  const mediaQueryList: MediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
  return Object.assign(mediaQueryList, {
    matches: mediaQueryList.matches,
    media: mediaQueryList.media,
    onchange: mediaQueryList.onchange,
  });
};

(window as any).matchMedia = matchMediaMock as (
  query: string
) => MediaQueryList;

// load the .env file
loadEnvConfig(process.cwd())

// RTK does not have fetch available
// so we use cross-fetch
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.AbortController = AbortController;

export const handlers = [
  rest.get("/api/book", (_req, res, ctx) => {
    console.log(_req.params)
    const response = get_books_200 as SuccessResponse<Book[]>;
    return res(ctx.status(response.status), ctx.json(response));
  }),
];

export const server = setupServer(...handlers);

// Enable the API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
});

// Disable the API mocking after the tests finished.
afterAll(() => server.close());
