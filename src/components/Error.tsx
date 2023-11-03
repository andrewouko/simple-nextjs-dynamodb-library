"use client";

import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  useColorModeValue
} from "@chakra-ui/react";

type Props = {
  title: string;
  message: string;
  retry?: () => void;
};

export default function ErrorFeedback({ title, message, retry }: Props) {
  return (
    <Flex
      bg={useColorModeValue("gray.100", "gray.900")}
      align="center"
      justify="center"
      minHeight={`100vh`}
      id="search"
    >
      <Box textAlign="center" py={10} px={6}>
        <Box display="inline-block">
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bg={"red.500"}
            rounded={"50px"}
            w={"55px"}
            h={"55px"}
            textAlign="center"
          >
            <IconButton
              onClick={() => (retry !== undefined ? retry() : null)}
              icon={<CloseIcon />}
              aria-label='Go Back'
            />
          </Flex>
        </Box>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          {title}
        </Heading>
        <Text color={"gray.500"}>{message}</Text>
      </Box>
    </Flex>
  );
}
