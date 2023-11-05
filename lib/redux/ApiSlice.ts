"use client";
import { Book, BookID, Borrow, GetBook, SuccessResponse, UpdateBook } from '@lib/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const BookAPI = createApi({
  reducerPath: 'BookAPI',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),

  endpoints: (builder) => ({
    getBooks: builder.query<SuccessResponse<Book[]>, GetBook>({
      query: (request_body: GetBook) => {
        let params: URLSearchParams;
        let url = `book`
        if(Object.keys(request_body).length){
          params = new URLSearchParams({
            ...(request_body.ISBN && { ISBN: request_body.ISBN }),
            ...(request_body.Author && { Author: request_body.Author }),
            ...(request_body.Title && { Title: request_body.Title }),
            ...(request_body.BorrowingStatus && { BorrowingStatus: request_body.BorrowingStatus }),

          });
          url = `${url}?${params.toString()}`
        }
        return {
          url,
        }
      },
    }),
    putBorrow: builder.mutation({
      query: (request_body: Borrow) => {
        return {
          url: `/book/borrow`,
          method: "PUT",
          body: request_body,
        };
      },
    }),
    deleteBorrow: builder.mutation({
      query: (request_body: BookID) => {
        return {
          url: `/book/borrow`,
          method: "DELETE",
          body: request_body,
        };
      },
    }),
    putBook: builder.mutation({
      query: (request_body: UpdateBook) => {
        return {
          url: `/book`,
          method: "PUT",
          body: request_body,
        };
      },
    }),
    deleteBook: builder.mutation({
      query: (request_body: Borrow) => {
        return {
          url: `/book`,
          method: "DELETE",
          body: request_body,
        };
      },
    }),
    postBook: builder.mutation({
      query: (request_body: Book) => {
        return {
          url: `/book`,
          method: "POST",
          body: request_body,
        };
      },
    }),
  }),
});

export const { useGetBooksQuery, usePutBorrowMutation, useDeleteBorrowMutation, usePutBookMutation, useDeleteBookMutation, usePostBookMutation } = BookAPI;

