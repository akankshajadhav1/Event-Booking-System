# Event Booking System - Backend APIs

This repository contains the backend APIs for the Event Booking System, built with **Node.js, Express, and SQLite**. It fulfills all assignment requirements, including role-based authentication and simulated asynchronous background tasks.

## Design Decisions
1. **Tech Stack**: 
   * **Node.js & Express**: Fast setup, lightweight, perfect for this API assignment.
   * **SQLite**: Chosen because it requires absolutely zero configuration or external services. Data is saved in a local `event_booking.db` file so it persists between server restarts during your demo recording.
2. **Authentication**: Implemented JWT (JSON Web Tokens). It allows stateless, scalable role-based access control checking whether the user is an `ORGANIZER` or a `CUSTOMER`.
3. **Background Tasks**: Since Node.js operates on an asynchronous event-driven loop, I used `setTimeout` inside asynchronous functions to simulate job processing (like sending emails and push notifications). In a real production app, this would be replaced by BullMQ, RabbitMQ, or AWS SQS. But for the purpose of this assignment demo, utilizing Node's built-in async capabilities fulfills the requirement flawlessly without adding heavy Docker dependencies.

## Setup Instructions
1. Install the dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
   *(The server will start on port 3000)*

## How to Record Your Demo (Loom)
Here is the step-by-step script for your video recording:

1. **Introduction**: Start the recording, show your face, and introduce yourself in English. Mention you built the backend in Node.js with SQLite and JWT Auth.
2. **Start the server**: Run `npm run dev` in the terminal. Show that the database connects.
3. **Register Users**: Use Postman (or ThunderClient/cURL) to hit `POST http://localhost:3000/auth/register` twice:
   * First: `{"username": "org1", "password": "123", "role": "ORGANIZER"}`
   * Second: `{"username": "cust1", "password": "123", "role": "CUSTOMER"}`
4. **Login**: Hit `POST http://localhost:3000/auth/login` to get the tokens for both users.
5. **Create Event (Organizer)**:
   * `POST http://localhost:3000/events` (Add Authorization Header: Bearer <ORGANIZER_TOKEN>)
   * Body: `{"title": "Music Fest", "description": "Live concert", "date": "2026-08-01", "total_tickets": 100}`
6. **Book Tickets (Customer) - DEMONSTRATING BACKGROUND TASK 1**:
   * `POST http://localhost:3000/events/1/book` (Add Authorization Header: Bearer <CUSTOMER_TOKEN>)
   * Body: `{"tickets_booked": 2}`
   * **CRITICAL**: Immediately show your terminal! Point out the `[BACKGROUND TASK 1: EMAIL CONFIRMATION]` log that appears a couple of seconds after the API responds.
7. **Update Event (Organizer) - DEMONSTRATING BACKGROUND TASK 2**:
   * `PUT http://localhost:3000/events/1` (Add Authorization Header: Bearer <ORGANIZER_TOKEN>)
   * Body: `{"title": "Music Fest - NEW DATE!"}`
   * **CRITICAL**: Show your terminal again! Point out the `[BACKGROUND TASK 2: EVENT UPDATE NOTIFICATION]` log showing it's notifying the customers who booked.
8. **Conclusion**: Conclude the video and stop recording.

Good luck with your submission!
