"use client";
import BookFormModal from "@/components/BookFormModal";
import ErrorFeedback from "@/components/Error";
import FilterBooks from "@/components/FilterBooks";
import { Box, Heading, Progress } from "@chakra-ui/react";
import BookTable from "@components/BookTable";
import { AddBookContext, RefetchContext } from "@lib/contexts";
import { useGetBooksQuery } from "@lib/redux/ApiSlice";
import { Book, GetBook } from "@lib/types";
import { useContextSafely } from "@lib/utils";
import { useState } from "react";

export default function Home() {
  const [params, setParams] = useState<GetBook>({});
  const { data, error, isLoading, isFetching, refetch } =
    useGetBooksQuery(params);
  const handleFilter = (book: GetBook) => {
    setParams(book);
  };
  const { data: isCreateOpen, setData: setIsCreateOpen } = useContextSafely(AddBookContext);
  let books: Book[];

  if (isLoading || isFetching) return <Progress size="lg" isIndeterminate />;

  if (error) {
    let error_msg = `Click on the close icon to go back`;
    return (
      <ErrorFeedback
        title={`Error retrieving books`}
        message={error_msg}
        retry={() => setParams({})}
      />
    );
  }

  books = data.data;

  return (
    <main>
      <Box mb={6}>
        <Heading as="h2" size="xl">
          Books List
        </Heading>
      </Box>
      <FilterBooks onFilter={handleFilter} />
      <RefetchContext.Provider
        value={{ data: () => refetch(), setData: () => {} }}
      >
        <BookTable data={books} />

        <BookFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        
      </RefetchContext.Provider>
    </main>
  );
}
