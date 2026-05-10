# Expert Session Booking System

A full-stack real-time expert session booking application built with React, Node.js, Express, MongoDB, and Socket.io.

## Features
- Expert listing with search, filter by category, and pagination
- Expert detail page with available time slots
- Real-time slot updates via Socket.io (when someone books a slot, it updates instantly for all users)
- Booking form with full validation
- My Bookings screen filtered by email with status (Pending/Confirmed/Completed)
- Double-booking prevention via atomic MongoDB update + unique index
- Proper error handling and loading states

## Tech Stack
- **Frontend:** React, React Router, Socket.io-client, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Validation:** express-validator

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)

### Backend Setup
```bash
cd backend
npm install
# Edit .env if needed (default: mongodb://localhost:27017/expert-booking)
node seed.js        # Seeds 10 sample experts with slots
npm start           # Starts server on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start           # Starts React app on port 3000
```

Open http://localhost:3000

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /experts | List experts (pagination + filter + search) |
| GET | /experts/:id | Expert detail with slots |
| POST | /bookings | Create a booking |
| GET | /bookings?email= | Get bookings by email |
| PATCH | /bookings/:id/status | Update booking status |

## Race Condition Prevention
Double booking is prevented at two levels:
1. **Application level:** Atomic `findOneAndUpdate` with `isBooked: false` condition
2. **Database level:** Unique compound index on `{expertId, date, timeSlot}`

## Real-Time Updates
Socket.io emits a `slotBooked` event whenever a booking is made. All connected clients instantly see the slot marked as unavailable.
