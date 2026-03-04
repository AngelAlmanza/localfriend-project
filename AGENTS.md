# Project
This project is a web application built using Next.js 16, Tailwind CSS, TypeScript, Shadcn UI, and Supabase. This application allows users to find products and services in their local area, providing a platform for businesses to connect with potential customers.

## Stack
- Next JS 16
- Tailwind CSS
- TypeScript
- Shadcn UI
- Supabase

## Code Style
- Use camelCase for variable and function names.
- Use PascalCase for component names.
- Use descriptive names for variables, functions, and components.
- Keep functions small and focused on a single task.
- Use consistent indentation (2 spaces).
- Use semicolons at the end of statements.
- Use single quotes for strings.

## Typescript conventions
- We should type all variables and function parameters to ensure type safety (not use `any`).
- Use types for component props to ensure that components receive the correct data.
- Use interfaces to define the shape of objects and data structures.

## Error Handling
- Use try-catch blocks to handle errors in asynchronous code.
- Use either type to represent success and error states in functions that can fail.
- Log errors to the console for debugging purposes, but avoid exposing sensitive information in error messages.

## Testing
- Write unit tests for functions and components to ensure they work as expected.
- Use a testing library like Jest or React Testing Library for writing tests.
- Test edge cases and error handling to ensure robustness.
- Use mock data and functions to isolate tests and avoid dependencies on external services.

## Version Control
- Use Git for version control
- Write clear and descriptive commit messages that explain the changes made, they must be in english and follow the format: `type(scope): description`, where type can be `feat`, `fix`, `docs`, `style`, `refactor`, `test`, or `chore`.

## Project Structure
```
app/
  (private)/
    admin/
      page.tsx
  auth/
    layout.tsx
    login/
      page.tsx

src/
  module/
    components/
      Button.tsx
      Card.tsx
    services/
      moduleService.ts
    types/
      moduleTypes.ts
    hooks/
      useModule.ts
    utils/
      moduleUtils.ts
    schemas/
      moduleSchema.ts
    store/
      moduleStore.ts
```
We are using Next.js App Router so the `app` directory is used for defining routes and layouts, while the `src` directory is used for organizing reusable components, services, types, hooks, and utilities. Each module has its own directory within `src` to keep related files together and maintain a clean project structure. Also exists an `shared` directory for components, hooks, and utilities that are used across multiple modules.

## Module structure
Only use app router to define routes and layout, all logic should be implemented in the `src` directory. Each module should have its own directory within `src` to keep related files together and maintain a clean project structure. The module structure should follow the pattern of having separate directories for components, services, types, hooks, and utilities (can have more folders).

## Forms
- Use controlled components for form inputs to manage form state effectively.
- Use react-hook-form for handling form validation and submission, as it provides a simple and efficient way to manage form state and validation.
- Use zod for schema validation to ensure that form data is validated against a defined schema, providing better error handling and user feedback.
- The schema should be internazionalized, so define an function called like `getFormNameShema` that receives an object `Record<string, string>` where each key is a name of the property and the value is the error message in corresponding language, this function should return a zod schema with the validation rules and error messages defined in the input object.

## Global State Management
- Use zustand for global state management, if a state needs to be shared across multiple components (even inside of same module) we should use zustand to manage that state, this will help us to avoid prop drilling and keep our components clean and focused on their own logic.

## Internationalization (i18n)
- We should give support for english and spanish languages, using next-intl for internationalization.

## Notes for agents
- In this project, we are using Supabase as our backend service for authentication, database, and storage. When working with Supabase, make sure to handle authentication securely and follow best practices for database interactions. When writing code that interacts with Supabase, ensure it is abstracted properly in services and hooks to maintain separation of concerns and make it easier to manage and test.
- Every component should be designed to be reusable and maintainable. Avoid hardcoding values and instead use props to pass data and configuration to components.
- Every component should be accessible and follow best practices for accessibility, such as using semantic HTML elements and providing appropriate ARIA attributes when necessary.


