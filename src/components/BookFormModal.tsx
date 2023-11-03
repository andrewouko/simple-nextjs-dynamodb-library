import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefetchContext } from "@lib/contexts";
import { usePostBookMutation, usePutBookMutation } from "@lib/redux/ApiSlice";
import { BookSchema, BorrowingStatus, UpdateBook } from "@lib/types";
import { useContextSafely } from "@lib/utils";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

const BookFormModal: React.FC<EditBookModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBook>({
    resolver: zodResolver(BookSchema),
    // defaultValues: initialData
  });

  const [updateBook, { isLoading, isError, error, data: result }] =
    usePutBookMutation();
  const [
    createBook,
    {
      isLoading: isCreateLoading,
      isError: isCreateError,
      error: createError,
      data: createResult,
    },
  ] = usePostBookMutation();
  const { data: refetch } = useContextSafely(RefetchContext);
  const toast = useToast();
  useEffect(() => {
    if (isError || isCreateError) {
      toast({
        title:
          initialData === undefined ? "Create Book Error" : "Update Book Error",
        description: `An error occurred during the ${
          initialData === undefined ? "creation" : "updating"
        } of a book.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    if (result || createResult) {
      refetch();
      onClose();
    }
  }, [isError, toast, onClose, result, refetch, initialData, isCreateError, createResult]);

  const onSubmit: SubmitHandler<UpdateBook> = (data) => {
    // console.log(data);
    if(initialData)
        return updateBook(data);
    createBook(data);
  };

  if (isLoading) return <Progress size="lg" isIndeterminate />;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} data-testid={"add-book-form"}>
          <ModalHeader>
            {initialData === undefined ? "Create New Book" : "Edit Book"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired isInvalid={errors.BookID ? true : false}>
              <FormLabel>Book ID</FormLabel>
              <Input
                placeholder="Book ID"
                {...register("BookID")}
                defaultValue={initialData?.BookID ?? uuidv4()}
                readOnly
              />
              <FormErrorMessage>{errors?.BookID?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.ISBN ? true : false}>
              <FormLabel>ISBN</FormLabel>
              <Input
                placeholder="ISBN"
                {...register("ISBN")}
                defaultValue={initialData?.ISBN}
              />
              <FormErrorMessage>{errors?.ISBN?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.Title ? true : false}>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="Title"
                {...register("Title")}
                defaultValue={initialData?.Title}
              />
              <FormErrorMessage>{errors?.Title?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.Author ? true : false}>
              <FormLabel>Author</FormLabel>
              <Input
                placeholder="Author"
                {...register("Author")}
                defaultValue={initialData?.Author}
              />
              <FormErrorMessage>{errors?.Author?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={errors.ImageURL ? true : false}>
              <FormLabel>Image URL</FormLabel>
              <Input
                placeholder="Image URL"
                {...register("ImageURL")}
                defaultValue={initialData?.ImageURL}
              />
              <FormErrorMessage>{errors?.ImageURL?.message}</FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={errors.BorrowingStatus ? true : false}
            >
              <FormLabel>Borrowing Status</FormLabel>
              <Select
                variant="outline"
                placeholder="All"
                {...register("BorrowingStatus")}
                defaultValue={initialData?.BorrowingStatus}
                isReadOnly={true}
              >
                <option value={BorrowingStatus.Available}>Available</option>
                <option value={BorrowingStatus.CheckedOut}>Checked Out</option>
              </Select>
              <FormErrorMessage>
                {errors?.BorrowingStatus?.message}
              </FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              isLoading={isSubmitting}
              type="submit"
            >
              {initialData === undefined ? "Create" : "Save"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Define the type for the modal props
interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UpdateBook;
}

export default BookFormModal;
