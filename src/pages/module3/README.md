# Module 3 - Event Management System Frontend

This folder contains the complete frontend for the Event Management System (Module 3) of the Student Success Platform.

## Features

### 1. **EventList.jsx** - Event Discovery & RSVP
   - Browse all campus events
   - Search events by title, description, or venue
   - Filter events by category
   - Toggle "Upcoming Only" filter
   - View detailed event information in a modal
   - RSVP to events directly from the card
   - Quick event details with date, location, capacity info

**Key Features:**
- Real-time search and filtering
- Event categories display
- Online vs. In-person event indicators
- RSVP status tracking
- Beautiful card layout with hover effects
- Responsive grid layout (1 to 3 columns)

### 2. **CreateEvent.jsx** - Event Organization
   - Create new campus events
   - Form validation with error messages
   - Support for online and in-person events
   - Set event capacity limits
   - Choose from predefined categories
   - Draft or publish events immediately
   - Success notifications with redirect

**Event Categories:**
- Tech Talk
- Networking
- Workshop
- Seminar
- Sports
- Cultural
- Academic
- Social
- Other

### 3. **MyEvents.jsx** - Event Registration Dashboard
   - View all registered/RSVPed events
   - Separate upcoming and past events
   - Event count badges
   - Quick event information display
   - Attendance status indicators

## Design & Styling

All components use the **Module 2 Color Scheme**:
- **Background**: `#090e17` (Dark Blue)
- **Cards**: `#121826` (Slightly Lighter Dark Blue)
- **Accent**: `#00d09c` (Bright Teal)
- **Text**: gray-300, white
- **Borders**: gray-800 (light), gray-800/50 (translucent)
- **Shadows**: Subtle with teal glow effects

### Design Elements:
- Rounded corners: `2rem`, `2.5rem`
- Smooth transitions on hover
- Glow effects on accent color elements
- Responsive design for mobile, tablet, and desktop
- Uses Lucide React icons throughout

## API Integration

All components connect to the backend API at `http://localhost:8080/api/v1/events`

### Supported Endpoints:
- `GET /api/v1/events` - List all events (with filters: category, upcoming)
- `GET /api/v1/events/{id}` - Get event details
- `POST /api/v1/events` - Create new event
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event
- `POST /api/v1/events/{eventId}/rsvp` - RSVP to event
- `PUT /api/v1/events/{eventId}/rsvp` - Update RSVP status
- `GET /api/v1/events/{eventId}/rsvps` - Get RSVPs for event
- `GET /api/v1/events/joined` - Get events user has joined

## Usage in App

Add routes to your main App.jsx:

```jsx
import { EventList, CreateEvent, MyEvents } from './pages/module3';

// In your router:
<Route path="/module3" element={<EventList />} />
<Route path="/module3/create-event" element={<CreateEvent />} />
<Route path="/module3/my-events" element={<MyEvents />} />
```

## Component Props & State

### EventList
- Fetches all events on mount
- Handles search, category filtering, and upcoming-only toggle
- Manages RSVP status per event
- Modal for detailed event view

### CreateEvent
- Form validation with custom error handling
- Handles both online and in-person events
- Dynamic venue field (hidden for online events)
- Publishing options
- Redirects to EventList on successful creation

### MyEvents
- Automatically fetches user's joined events
- Separates upcoming from past events
- Shows attendance status

## Icons Used

Components use these Lucide React icons:
- `Calendar` - Date & time
- `MapPin` - Location
- `Users` - Capacity & online events
- `Clock` - Upcoming events
- `Tag` - Categories
- `Search` - Search input
- `Loader2` - Loading state
- `Plus` - Create button
- `X` - Modal close
- `ChevronLeft`, `ChevronRight` - Navigation
- `Save` - Submit button
- `AlertCircle`, `CheckCircle` - Error & success states

## Authentication

All API requests include Bearer token authentication:
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

Token is retrieved from localStorage as `accessToken`

## Responsive Design

- **Mobile**: Single column layout
- **Tablet** (md): Two columns
- **Desktop** (xl): Three columns
- All components adapt to screen size

## Error Handling

- Form validation with field-specific error messages
- API error feedback to users
- Network error handling with console logging
- Success notifications with auto-redirect

## Future Enhancements

- Event edit functionality
- Advanced filtering (date range, attendees)
- Event ratings and reviews
- Calendar view
- Export events to calendar apps
- Reminder notifications
