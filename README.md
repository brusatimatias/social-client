# Social App

## Table of Contents

- [Description](#description)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
  - [Configuration of Environment Variables](#configuration-of-environment-variables)
- [Usage](#usage)

# Description

Social App is a React-based web application that simulates a social network. It allows users to register, follow other users, create posts, and use a messaging service with other users.

## Features

- **User Registration:** Users can sign up on the platform by providing basic information.

- **Follow Other Users:** Users can follow other users and view their posts in their feed.

- **Posts:** Users can create, edit, and delete posts, which will be visible to their followers.

- **Messaging:** Users can send private messages to other users.

## Technologies Used

- **React:** The application is built using the React library to create interactive user interfaces.

- **Social API:** The Social API is used to retrieve user and post information.

- **Social Messaging API:** The Social Messaging API is used to manage the messaging service.

## System Architecture

This diagram outlines the client-side architecture of Project Name, illustrating how clients interact with the application's components:

![System Architecture](doc/Social%20App-architecture.drawio.png)

The client-side architecture diagram provides an overview of how the various components of the application work together on the client side. It highlights the interactions between communication with external APIs.

## Installation

1. Clone this repository to your local machine using `git clone git@github.com:brusatimatias/social-client.git`.

2. Navigate to the project directory using `cd social-client`.

3. Install the dependencies using npm or yarn:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Configure the necessary environment variables for connecting to the APIs (e.g., API keys, URLs, etc.).

5. Copy the example file `.env.dev` and rename it to `.env`:

   ```bash
   cp .env.dev .env
   ```

6. Edit the `.env` file and configure the required environment variables:

   ```dotenv
   PORT=8000
   REACT_APP_SOCIAL_API_URL=URL_OF_SOCIAL_API
   REACT_APP_SOCIAL_MESSAGING_API_URL=URL_OF_MESSAGING_API
   ```

   Replace `URL_OF_SOCIAL_API` and `URL_OF_MESSAGING_API`with the appropriate URLs provided by the respective APIs.

7. Start the application:

   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at `http://localhost:8000`.

## Usage

1. Register or log in to the application.
2. Explore the application and start following other users.
3. Create posts and share your content with your followers.
4. Use the messaging service to communicate with other users.
