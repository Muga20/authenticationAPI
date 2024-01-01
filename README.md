# Express Application with JWT Authentication

This Express application implements authentication using JSON Web Tokens (JWT).

## Overview

The authentication system in this application is based on JSON Web Tokens (JWT), a widely-used method for securely transmitting information between parties. Here's a brief overview of how it works:

1. **User Registration (`/auth/register`):**
   - Users can register by providing their credentials (firstName, last_name, username, email, password ).
   - The application hashes and stores the user's password securely (e.g., using bcrypt) in a database.

2. **User Login (`/auth/login`):**
   - Upon login, users provide their credentials.
   - The application verifies the credentials against the stored information.
   - If the credentials are valid, the application generates a JWT and sends it back to the user.

3. **JWT Generation and Verification:**
   - The JWT is a token containing encoded information about the user's identity.
   - It's signed with a secret key known only to the server.
   - The user sends this token with subsequent requests (usually in the Authorization header).
   - Each request requiring authentication is validated by checking the token's signature and decoding its information.

4. **Protected Routes (`/user/get_users`, etc.):**
   - Certain routes or resources (e.g., get_users, get_users_if_admin, get_single_user ) are protected and require a valid JWT to access.
   - The server verifies the token's validity and grants access if the token is valid and has not expired.


5. **Account Recovery (Forgot Password):**
   - Users who have forgotten their passwords can recover their accounts through a 'forgot password' functionality.
   - To initiate the password recovery process, users can request a password reset link.

6. **Password Reset (`/auth/forgot_password`):**
   - Upon requesting a password reset, the application sends a unique link to the user's registered email.
   - Users can follow the link to reset their passwords securely.
   - After resetting the password, users can log in using the new credentials.



## Creating User Roles

To enhance the application's security and manage user permissions, consider implementing user roles. Roles can define different levels of access and functionalities within the application. Here's how you can incorporate roles:

1. **Define Roles (`/auth/create_users_roles`):**
   - Create an endpoint or functionality to define roles (admin, user, verified) within the application.
   - Roles can determine what users can access or modify.
2. **Checking available Roles (`/auth/get-roles`):**
  - To access this endpoint and retrieve available roles, the user making the request must have either the 'admin' or 'verified' role assigned.
   - Roles define user access and permissions.
3. **Assign Roles to Users:**
   - After defining roles, create a mechanism to assign roles to registered users.
   - Users can have specific roles that define their access levels and permissions.

Implementing user roles provides finer control over the application's functionalities and access rights, allowing you to manage user permissions effectively.

Ensure that role-based access control (RBAC) is appropriately integrated into the application, granting access based on user roles and restricting unauthorized actions.

## Using Postman for Testing

You can utilize Postman to interact with the authentication endpoints:

1. **Register a User (`/auth/register`):**
   - Send a POST request with user credentials to `/auth/register` to create a new user.

2. **Login (`/auth/login`):**
   - Send a POST request with valid user credentials to `/auth/login` to receive a JWT.

3. **Access Protected Routes (`/user/get_users`, etc.):**
   - Use the received JWT by including it in the Authorization header of subsequent requests to access protected routes.

This JWT-based authentication system provides a secure way to manage user access to protected resources within the application. It ensures that only authenticated and authorized users can access specific endpoints or functionalities.

## Environment Configuration

Before running or testing the application, ensure to set up the following environment variables in your configuration file (e.g., `.env` file):

#```dotenv
# Database Configuration
DB_NAME=               # Your database name
DB_USER=               # Database username
DB_PASSWORD=           # Database password
DB_HOST=               # Database host
DB_DIALECT=mysql       # Database dialect (e.g., mysql, postgres, etc.)

# Express Server Configuration
EXP_PORT=              # Express server port
BASE_URL=              # Base URL for the server
CLIENT_URL=            # Client application URL

# Token Secrets
ACCESS_TOKEN_SECRET=   # Secret key for access token
REFRESH_TOKEN_SECRET=  # Secret key for refresh token

# Server Configuration
HOST=                  # Server host
PORT=                  # Server port
SECURE=                # Boolean flag for secure connection (true/false)


## Installation

### Prerequisites
- Node.js installed
- npm or yarn

### Clone the repository
```bash
git clone https://github.com/Muga20/JWT_authentication.git

