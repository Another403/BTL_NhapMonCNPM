# apartment-fee-collection-manager

A web app allows users to manage households registration, fees collection and personal vehicles of an apartment.

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [Getting started](#getting-started)

## Project Overview

The project is a fullstack web application built using MERN (MongoDB, Express.js, React.js, Node.js) stack.

## Technologies

#### Frontend

- React.js
- React router
- Antd
- SASS/SCSS
- Redux
- Axios

#### Backend

- MongoDB
- Express.js
- Node.js
- Node-cron
- Bcrypt
- Mongoose
- Cors

## Getting started

### Prerequisites

Before running this application, make sure you have:

- Node.js installed
- MongoDB account

### Installation

1. Clone the repository using `git clone`
2. Create 2 terminals for backend and frontend. Run `cd server` for backend and `cd client` for frontend
3. Install required dependencies for both backend and frontend using `npm ci`
4. Create a `.env` file for backend

```bash
MONGODB_PASSWORD= your MongoDB password
PORT= your server port (example: 8386)
```

5. Start the backend and frontend by running `npm start` on each terminal