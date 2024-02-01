# education-task-api

## admin api

### Admin

-   teacher account register
-   remove user
-   unblock user
-   add subject
-   remove subject

-   get all subject
-   get all teacher
-   get all student

## user api

### User

-   get user detail
-   get all test
-   get test detail by id

> Teacher User

-   add question into subject
-   search question
-   update/delete question
-   change question status
-   create test

> Student User

-   registration into a test
-   get all test student
-   get upcoming test
-   start a test
-   get all completed test
-   get result test

# Step for run project

> Step 1 : Clone project github :

git clone https://github.com/DoThanhNamTVB/education-task-api

> Step 2 : In project clone, please dowload all dependences in package.json :

npm i / npm install

> Step 3 : Config file .env from .env-example

> Step 4 : Running server with command line :

-   npm start ( run project normally)
-   npm run dev (run with nodemon)

> Step 5 : Test project with swagger ui : path /api-docs

example : http://localhost:3000/api-docs/
Notes : In file swagger.yaml , I set default port = 3001, so if you run respos with port different 3001, please fix it at inline 9

# Step for run linter and formatter
- step 0: run cli : npm i
- step 1: run cli : npm run prepare
- step 2: run cli : npx husky add .husky/pre-commit "npx lint-staged"
- step 3: completed. You can check with cli:  
    + check formatter : run cli -> npm run format
    + check linter : run cli -> npm run fix
    + check pre-commit : When you commit code, it will run automatically linter and formatter

