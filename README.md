# Chat App Backend

## Overview
This project is a backend for a chat application. It is designed to handle user interactions, manage messages, and provide a seamless experience for users.

## Folder Structure
The project is organized into the following main directories:

- **src**: Contains the source code for the application.
  - **controllers**: Handles incoming requests and returns responses for specific resources.
  - **models**: Defines the data structure and schema for the application.
  - **routes**: Maps HTTP requests to controller methods.
  - **services**: Encapsulates business logic and interacts with models.
  - **utils**: Contains utility functions and helpers.

- **config**: Holds configuration files for the application, including environment variables and database settings.

- **tests**: Contains test files for unit and integration tests to ensure functionality.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd chat-app-backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Configure environment variables:
   - Create a `.env` file in the root directory and add the necessary configuration.

5. Start the application:
   ```
   npm start
   ```

## Usage
- The API endpoints can be accessed at `http://localhost:PORT/api`.
- Refer to the individual route files in the `src/routes` directory for specific endpoints and their usage.

## Testing
- Run tests using:
   ```
   npm test
   ```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License
This project is licensed under the MIT License.