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
import { Book, BookID, Borrow, BorrowedRecord } from "@lib/types";
import { getQueryErrorToastOptions, getUser, useContextSafely } from "@lib/utils";
import { useDeleteBorrowMutation } from "@lib/redux/ApiSlice";
import { RefetchContext, UserContext } from "@lib/contexts";

export default function BorrowedRecordModal({
  isOpen,
  onClose,
  BorrowedRecord,
  BookID,
}: Props) {
  const [returnBook, { isLoading, isError, error, data: result }] =
    useDeleteBorrowMutation();
  const { data: refetch } = useContextSafely(RefetchContext);
  const { data: userId } = useContextSafely(UserContext);
  const handleReturnBook = async (data: Borrow) => {
    returnBook(data);
  };
  const toast = useToast();
  useEffect(() => {
    if (isError && error) {
      toast(getQueryErrorToastOptions('Return book error', error));
    }
    if (isError || result) {
      onClose();
    }
    if(result){
      refetch()
    }
  }, [isError, toast, onClose, result, refetch, error]);

  console.log(error)

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
          <Button
            colorScheme="red"
            onClick={() => handleReturnBook({ ...BookID, BorrowerID: userId })}
          >
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
