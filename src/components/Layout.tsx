"use client";

import { AddIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Users } from "@lib/constants";
import { AddBookContext, UserContext } from "@lib/contexts";
import { User } from "@lib/types";
import { getUser, useContextSafely } from "@lib/utils";
import NextLink from "next/link";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

interface NavLinkProps extends Props {
  href: string;
}

const Links = [
  { label: "Books", href: "/" },
  // { label: "Users", href: "/users" },
];

const default_user_id = "user1";

const NavLink = ({ children, href }: NavLinkProps) => {
  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
    >
      <Link as={NextLink} href={href}>
        {children}
      </Link>
    </Box>
  );
};

const NavLinks = Links.map((link) => (
  <NavLink key={link.label} href={link.href}>
    {link.label}
  </NavLink>
));

export default function Layout({ children }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: userId, setData: setUserId } = useContextSafely(UserContext);
  const { setData: setIsCreateOpen } = useContextSafely(AddBookContext);
  const [current_user, setCurrentUser] = useState<User | undefined>(undefined);
  useEffect(() => {
    if (userId.length < 1) return setUserId(default_user_id);
    const current_user = getUser(userId);
    if (current_user) setCurrentUser(current_user);
  }, [userId, setUserId]);
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <NextLink href="/" passHref>
              <Image
                src="/img/logo.png"
                alt="Logo"
                objectFit="cover"
                w={["40px", "80px"]}
                h={["40px", "80px"]}
              />
            </NextLink>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {NavLinks}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              size={"sm"}
              mr={4}
              leftIcon={<AddIcon />}
              onClick={() => setIsCreateOpen(true)}
            >
              Add Book
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar size={"sm"} src={current_user?.image_url} />
              </MenuButton>
              <MenuList>
                {Users.sort().map((user) => (
                  <div key={user.id}>
                    <MenuItem
                      onClick={() => {
                        setUserId(user.id);
                      }}
                    >
                      {user.name}
                    </MenuItem>
                    <MenuDivider />
                  </div>
                ))}
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {NavLinks}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box p={4}>{children}</Box>
    </>
  );
}
