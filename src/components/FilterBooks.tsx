import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Input,
  Flex,
  Button,
  Stack,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  FormErrorMessage,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BorrowingStatus, GetBook, borrowing_status_prop_type, isbn_prop_type } from "@lib/types";
import { z } from "zod";

const FilterBooks = ({ onFilter }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GetBook>({
    resolver: zodResolver(
      z.object({
        ISBN: z.string().optional(),
        Title: z.string().optional(),
        Author: z.string().optional(),
        BorrowingStatus: z.string().optional(),
      })
    ),
  });

  const onSubmit: SubmitHandler<GetBook> = (data) => {
    onFilter(data);
  };

  return (
    <Flex justifyContent="space-between" mb={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={[2, 4, 10]} direction={["column", "row"]} mb={2}>
          <FormControl isInvalid={errors.Title ? true : false}>
            <FormLabel>Title</FormLabel>
            <InputGroup>
              <Input {...register("Title")} placeholder="Title" />
            </InputGroup>
            <FormErrorMessage>{errors?.Title?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.Author ? true : false}>
            <FormLabel>Author</FormLabel>
            <InputGroup>
              <Input {...register("Author")} placeholder="Author" />
            </InputGroup>
            <FormErrorMessage>{errors?.Author?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.ISBN ? true : false}>
            <FormLabel>ISBN</FormLabel>
            <InputGroup>
              <Input {...register("ISBN")} placeholder="ISBN" />
            </InputGroup>
            <FormErrorMessage>{errors?.ISBN?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.BorrowingStatus ? true : false}>
            <FormLabel>Borrowing Status</FormLabel>
            <InputGroup>
              <Select
                {...register("BorrowingStatus")}
                placeholder="Borrowing Status"
              >
                <option value={undefined}>All</option>
                <option value={BorrowingStatus.Available}>Available</option>
                <option value={BorrowingStatus.CheckedOut}>Checked Out</option>
              </Select>
            </InputGroup>
            <FormErrorMessage>{errors?.BorrowingStatus?.message}</FormErrorMessage>
          </FormControl>
        </Stack>
        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isSubmitting}
          w={["full", "auto"]}
        >
          Apply Filters
        </Button>
      </form>
    </Flex>
  );
};

interface Props {
  onFilter: (book: GetBook) => void;
}

export default FilterBooks;
