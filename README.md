# Introduction
This is a [Next.js] Typescript project to showcase the use of DynamoDB. It represents a simple Library application.

## Dependencies
1. @aws-sdk/client-dynamodb: client library for DynamoDB
2. @aws-sdk/lib-dynamodb: tools for interacting with the DynamoDB library in an easier way.
3. TypeScript compiler: for the setup of your application
4. UUID: unique identifier generator
5. ZOD: validation tool
6. ChakraUI: rapid prototyping on the frontend
7. ChakraUI Icons: icon library
8. Redux Toolkit: API slices & mware
9. Redux: state management
10. react-hook-form: form builder
11. @hookform/resolvers: zodResolver to validate zod schemas for the forms

## Getting Started

1. Setup the environment by providing the following in a .env file or equivalent
    - AWS_REGION : E.g. "us-east-1" or it will use 'localhost' by default.
    - AWS_ACCESS_KEY_ID : Uses "None" by default
    - AWS_DYNAMODB_ENDPOINT : Uses "http://localhost" by default
    - AWS_DYNAMODB_PORT: **If running locally, set this to the port number of your instance. Uses 8000 by default.**
    - AWS_SECRET_ACCESS_KEY : Uses "None" by default
2. Install the dependencies
```bash
npm i
```
3. Create the library DynamoDB table
```bash
npx tsc --build --clean && npx tsc ./config/setup_dynamodb.ts
```
4. Build the application:
```bash
npm run build
```
5. Test the application:
```bash
npm run test
```
6. Start the application if tests are successful:
```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Design Assumptions
1. Each Book has only one copy available
2. A Book can only be borrowed by one User
3. Once borrowed a book is marked as unavailable and cannot be borrowed by another user