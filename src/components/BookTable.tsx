"use client";
import {
  Badge,
  Button,
  HStack,
  Progress,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { RefetchContext, UserContext } from "@lib/contexts";
import {
  useDeleteBookMutation,
  usePutBorrowMutation,
} from "@lib/redux/ApiSlice";
import {
  Book,
  BookID,
  Borrow,
  BorrowedRecord,
  BorrowingStatus,
  UpdateBook,
} from "@lib/types";
import { getUser, useContextSafely } from "@lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useEffect } from "react";
import BookFormModal from "./BookFormModal";
import BorrowedRecordModal from "./BorrowedRecordModal";
import ConfirmationDialog from "./ConfirmationDialog";
import { DataTable } from "./DataTable";

export default function BookTable({ data }: Props) {
  const { data: userId } = useContextSafely(UserContext);
  const current_user = getUser(userId);
  const [borrowBook, { isLoading, isError, error, data: result }] =
    usePutBorrowMutation();
  const [
    deleteBook,
    {
      isLoading: isDeleteLoading,
      isError: isDeleteError,
      error: deleteError,
      data: deleteResult,
    },
  ] = useDeleteBookMutation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [selectedBorrower, setSelectedBorrower] = React.useState<
    BorrowedRecord | undefined
  >(undefined);
  const [selectedBookID, setSelectedBookID] = React.useState<
    BookID | undefined
  >(undefined);
  const [updateBook, setUpdateBook] = React.useState<UpdateBook | undefined>(
    undefined
  );
  const [deleteId, setDeleteId] = React.useState<BookID | undefined>(undefined);
  const { data: refetch } = useContextSafely(RefetchContext);
  const handleViewBorrower = (borrower: BorrowedRecord, BookID: BookID) => {
    setSelectedBorrower(borrower);
    setSelectedBookID(BookID);
    onOpen();
  };
  const handleEditBook = (book: UpdateBook) => {
    setUpdateBook(book);
    onEditOpen();
  };
  const closeModal = () => {
    setSelectedBorrower(undefined);
    onClose();
  };
  const handleBorrow = async (data: Borrow) => {
    borrowBook(data);
  };
  const handleDeleteConfirm = (data: BookID) => {
    setDeleteId(data)
    onConfirmOpen()
  };
  const handleDeleteBook = () => {
    if(deleteId !== undefined)
      deleteBook(deleteId);
  }

  useEffect(() => {
    if (isDeleteError) {
      toast({
        title: "Delete Book Error",
        description: `An error occurred while deleting the book`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    if (deleteResult || isDeleteError) {
      refetch();
      onClose();
    }
  }, [isDeleteError, deleteResult, onClose, refetch, toast]);

  useEffect(() => {
    if (isError) {
      toast({
        title: "Add Borrowing Error",
        description: `Borrowing by user: ${current_user?.name} failed.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    if (result) {
      refetch();
    }
  }, [isError, result, current_user, toast, refetch]);

  const columnHelper = createColumnHelper<Book>();
  const columns = [
    columnHelper.accessor("ISBN", {
      header: "ISBN Code",
    }),
    columnHelper.accessor("Title", {
      header: "Title",
    }),
    columnHelper.accessor("Author", {
      header: "Author",
    }),
    columnHelper.accessor("BorrowingStatus", {
      header: "Borrowing Status",
      cell: (info) => (
        <Badge colorScheme={info.getValue() === "Available" ? "green" : "red"}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("BookID", {
      header: "Actions",
      cell: (info) => (
        <HStack spacing={3}>
          <Button
            colorScheme="telegram"
            size="sm"
            onClick={() => handleEditBook(info.row.original)}
          >
            Edit
          </Button>
          {info.row.original.BorrowingStatus == BorrowingStatus.Available && (
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => {
                handleBorrow({
                  BookID: info.row.original.BookID,
                  ISBN: info.row.original.ISBN,
                  BorrowerID: userId,
                });
              }}
            >
              Borrow
            </Button>
          )}
          {info.row.original.BorrowingStatus == BorrowingStatus.CheckedOut && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => {
                const borrower = info.row.original.BorrowedRecord;
                const BookID = info.row.original.BookID;
                const ISBN = info.row.original.ISBN;
                if (borrower) handleViewBorrower(borrower, { BookID, ISBN });
              }}
            >
              View Borrower
            </Button>
          )}
          <Button
            colorScheme="orange"
            size="sm"
            onClick={() => {
              handleDeleteConfirm({
                BookID: info.row.original.BookID,
                ISBN: info.row.original.ISBN,
              });
            }}
          >
            Delete
          </Button>
        </HStack>
      ),
    }),
  ];

  if (isLoading) return <Progress size="lg" isIndeterminate />;

  return (
    <>
      <DataTable columns={columns} data={data} />
      {selectedBorrower && selectedBookID && (
        <BorrowedRecordModal
          isOpen={isOpen}
          onClose={closeModal}
          BorrowedRecord={selectedBorrower}
          BookID={selectedBookID}
        />
      )}
      {updateBook && (
        <BookFormModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          initialData={updateBook}
        />
      )}
      {deleteId && (
        <ConfirmationDialog
          title={`Delete Book`}
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          message={`Are you sure you want to delete this book?`}
          onConfirm={handleDeleteBook}
        />
      )}
    </>
  );
}

interface Props {
  data: Book[];
}
