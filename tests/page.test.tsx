import Home from "@/app/page";
import FilterBooks from "@/components/FilterBooks";
import { Users } from "@lib/constants";
import { AddBookContext, UserContext } from "@lib/contexts";
import { store } from "@lib/redux/store";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { server } from "../jest.setup";
import { rest } from "msw";
import get_books_200 from "@mocks/200-get-books.json";
import { Book, SuccessResponse } from "@lib/types";

describe("Home page", () => {
  it("renders with initial loading state", () => {
    const user = Users[0].id;
    const addBook = false;
    render(
      <Provider store={store}>
        <UserContext.Provider value={{ data: user, setData: () => {} }}>
          <AddBookContext.Provider value={{ data: addBook, setData: () => {} }}>
            <Home />
          </AddBookContext.Provider>
        </UserContext.Provider>
      </Provider>
    );
    const loadingIndicator = screen.getByRole("progressbar");
    expect(loadingIndicator).toBeInTheDocument();
  });
  it("renders book table with test data from a successful GET request without filters", async () => {
    const user = Users[0].id;
    const addBook = false;
    render(
      <Provider store={store}>
        <UserContext.Provider value={{ data: user, setData: () => {} }}>
          <AddBookContext.Provider value={{ data: addBook, setData: () => {} }}>
            <Home />
          </AddBookContext.Provider>
        </UserContext.Provider>
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("book-table")).toBeInTheDocument();
      // check if one of the book's isbn exists
      expect(screen.getByText("978-1-933624-76-3")).toBeInTheDocument();
    });
  });
  it("renders filter component", async () => {
    const user = Users[0].id;
    const addBook = false;
    render(
      <Provider store={store}>
        <UserContext.Provider value={{ data: user, setData: () => {} }}>
          <AddBookContext.Provider value={{ data: addBook, setData: () => {} }}>
            <Home />
          </AddBookContext.Provider>
        </UserContext.Provider>
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("books-filter")).toBeInTheDocument();
    });
  });
  it("filter component allows filtering of results", async () => {
    const user = Users[0].id;
    const addBook = false;

    // Create a spy function to mock the `onFilter` function
    const handleFilter = jest.fn();
    render(
      <Provider store={store}>
        <UserContext.Provider value={{ data: user, setData: () => {} }}>
          <AddBookContext.Provider value={{ data: addBook, setData: () => {} }}>
            <FilterBooks onFilter={handleFilter} />
          </AddBookContext.Provider>
        </UserContext.Provider>
      </Provider>
    );

    act(() => {
      // Assertions for filter component rendering
      const titleInput = screen.getByPlaceholderText("Title");
      const authorInput = screen.getByPlaceholderText("Author");
      const isbnInput = screen.getByPlaceholderText("ISBN");
      const borrowingStatusSelect = screen.getByRole("combobox");

      // Fire events to update the form inputs
      fireEvent.input(titleInput, { target: { value: "Sample Title" } });
      fireEvent.input(authorInput, { target: { value: "Sample Author" } });
      fireEvent.input(isbnInput, { target: { value: "1234567890" } });
      fireEvent.change(borrowingStatusSelect, {
        target: { value: "Available" },
      });

      // Submit the form
      const applyFiltersButton = screen.getByText("Apply Filters");
      fireEvent.click(applyFiltersButton);
    });

    // Assertions
    await waitFor(() => {
      expect(handleFilter).toHaveBeenCalledWith({
        Title: "Sample Title",
        Author: "Sample Author",
        ISBN: "1234567890",
        BorrowingStatus: "Available",
      });
    });
  });
  it("renders filtered results", async () => {
    const user = Users[0].id;
    const addBook = false;
    const test_isbn = "978-1-933624-76-3";

    render(
      <Provider store={store}>
        <UserContext.Provider value={{ data: user, setData: () => {} }}>
          <AddBookContext.Provider value={{ data: addBook, setData: () => {} }}>
            <Home />
          </AddBookContext.Provider>
        </UserContext.Provider>
      </Provider>
    );

    act(() => {
      // Assertions for filter component rendering
      const isbnInput = screen.getByPlaceholderText("ISBN");

      // Fire events to update the form inputs
      fireEvent.input(isbnInput, { target: { value: test_isbn } });

      // Submit the form
      const applyFiltersButton = screen.getByText("Apply Filters");
      fireEvent.click(applyFiltersButton);
    });

    // Assertions
    await waitFor(() => {
      expect(screen.getByText(test_isbn)).toBeInTheDocument();
    });
  });
});
