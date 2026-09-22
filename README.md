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

Social App is a React + TypeScript web client for the Social API and the Social Messaging API. It allows users to register, follow each other, create posts (with photos/videos), comment and like posts, and exchange direct messages in real time.

## Features

- **User Registration & Login:** Sign up, log in, update your profile, and delete your account.

- **Posts:** Create, edit, and delete posts (public or followers-only, draft/published/archived), optionally with photo/video attachments.

- **Feed:** Browse a paginated feed of public posts and posts from people you follow.

- **Comments & Likes:** Comment on posts and like/unlike them.

- **Followers:** Follow and unfollow other users, and browse followers/following lists.

- **Direct Messaging:** Start a 1:1 conversation with another user and exchange messages in real time.

## Technologies Used

- **React 19 + TypeScript** — UI library and static typing.
- **Vite** — dev server and build tool.
- **Tailwind CSS** — styling.
- **React Router** — client-side routing.
- **TanStack Query** — server state, caching, and mutations.
- **Axios** — HTTP client.
- **Socket.IO Client** — real-time delivery of incoming direct messages.
- **Vitest + React Testing Library** — testing.
- **Social API** — backend used to retrieve/mutate user, post, comment, like, and follow data.
- **Social Messaging API** — backend used for conversations and direct messages.

## System Architecture

This diagram outlines the client-side architecture of Project Name, illustrating how clients interact with the application's components:

![System Architecture](doc/Social%20App-architecture.drawio%20v2.png)

The client-side architecture diagram provides an overview of how the various components of the application work together on the client side. It highlights the interactions between communication with external APIs.

## Installation

1. Clone this repository to your local machine using `git clone git@github.com:brusatimatias/social-client.git`.

2. Navigate to the project directory using `cd social-client`.

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

5. Edit `.env.local` and point it at your running Social API and Social Messaging API instances:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_MESSAGING_API_BASE_URL=http://localhost:3001
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8000`.

## Usage

1. Register or log in to the application.
2. Explore the feed, and follow other users to see their posts.
3. Create posts (with or without media) and share your content.
4. Comment and like posts, and manage your profile from `/profile/me`.
5. Start a direct conversation with another user from `/messages`, and chat in real time.
