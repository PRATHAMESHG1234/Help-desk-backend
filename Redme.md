# Help Desk Backend

This is the backend codebase for a Help Desk application. It provides the server-side functionalities for managing customer support tickets. It is built using Node.js and the Express.js framework.

## Project Setup

1. Clone the repository to your local machine.
2. Run `npm install` to install the project dependencies.
3. Rename the `config/default-example.json` file to `config/default.json` and edit the values in the file to match your environment.
4. Run `npm run start` to start the server.

## Project Structure

The project is structured as follows:

|- server.js
|- config/
| |- default.json
|- middleware/
| |- auth.js
| |- functions.js
| |- mailer.js
| |- managementType.js
|- models/
| |- Access.js
| |- Comment.js
| |- Customers.js
| |- Management.js
| |- Ticket.js
| |- User.js
|- routes/
| |- admin.js
| |- agent.js
| |- superadmin.js
| |- ticket.js
| |- user.js
|- utils/
| |- db.js

markdown
Copy code

- `server.js`: This is the entry point of the application.

- `config`: This folder contains the configuration file for setting up the server and database connection.
- `middleware`: This folder contains middleware functions for authentication, sending emails, and managing different user types.
- `models`: This folder contains the database models for Access, Comment, Customer, Management, Ticket, and User.
- `routes`: This folder contains the route handlers for different endpoints of the application. It includes routes for admin, agent, superadmin, ticket, and user.
- `utils`: This folder contains utility functions for managing the database connection.

## APIs

The following APIs are available in the application:

- `/api/tickets`: GET, POST, PUT, DELETE
- `/api/comments`: GET, POST
- `/api/users`: GET, POST, PUT, DELETE

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose

## Contributing

Contributions to this project are welcome. To contribute, please create a pull request with your changes. Make sure your changes pass the project's linting and testing rules.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
