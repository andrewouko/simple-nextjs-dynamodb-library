"use client";
import BookFormModal from "@/components/BookFormModal";
import ErrorFeedback from "@/components/Error";
import FilterBooks from "@/components/FilterBooks";
import { Box, Heading, Progress, useToast } from "@chakra-ui/react";
import BookTable from "@components/BookTable";
import { AddBookContext, RefetchContext } from "@lib/contexts";
import { useGetBooksQuery } from "@lib/redux/ApiSlice";
import { Book, GetBook } from "@lib/types";
import { getQueryErrorToastOptions, useContextSafely } from "@lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [params, setParams] = useState<GetBook>({});
  const { data, error, isLoading, isFetching, refetch } =
    useGetBooksQuery(params);
  const [books, setBooks] = useState<Book[]>([]);
  const handleFilter = (book: GetBook) => {
    setParams(book);
  };
  const { data: isCreateOpen, setData: setIsCreateOpen } = useContextSafely(AddBookContext);
  const toast = useToast()

  useEffect(() => {
    if(error){
      toast(getQueryErrorToastOptions(`Error retrieving books`, error))
    }
    if(data){
      setBooks(data.data);
    }
  }, [error, toast, data, setBooks]);

  if (isLoading || isFetching) return <Progress size="lg" isIndeterminate />;

  // console.log(books)

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
