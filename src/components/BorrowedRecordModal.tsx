// BorrowedRecordModal.js
import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Button,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { Book, BookID, BorrowedRecord } from "@lib/types";
import { getUser, useContextSafely } from "@lib/utils";
import { useDeleteBorrowMutation } from "@lib/redux/ApiSlice";
import { RefetchContext } from "@lib/contexts";

export default function BorrowedRecordModal({
  isOpen,
  onClose,
  BorrowedRecord,
  BookID,
}: Props) {
  const [returnBook, { isLoading, isError, error, data: result }] =
    useDeleteBorrowMutation();
  const { data: refetch } = useContextSafely(RefetchContext);
  const handleReturnBook = async (data: BookID) => {
    returnBook(data);
  };
  const toast = useToast();
  useEffect(() => {
    if (isError) {
      toast({
        title: "Return Error",
        description: `An error occurred during the return.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    if (isError || result){
        refetch()
        onClose()
    }
  }, [isError, toast, onClose, result, refetch]);

  if (isLoading) return <Progress size="lg" isIndeterminate />;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Borrowed Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Borrower: {getUser(BorrowedRecord.BorrowerID)?.name ?? ""}
          </Text>
          <Text>
            Borrowed Date:{" "}
            {new Date(BorrowedRecord.BorrowedDate).toLocaleString()}
          </Text>
          <Text>
            Return Date: {new Date(BorrowedRecord.ReturnDate).toLocaleString()}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={() => handleReturnBook(BookID)}>
            Return Book
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  BorrowedRecord: BorrowedRecord;
  BookID: BookID;
}
