# Meeting Scheduler System - Frontend Documentation

## Overview

The Meeting Scheduler is a collaborative tool that enables group members to coordinate meeting times by proposing multiple date options and collecting availability responses from all participants.

## Features

### 1. **MeetingList.jsx** - View All Meetings
Browse and manage all meetings for a selected project group.

**Features:**
- Group selector dropdown to filter meetings
- Display all scheduled meetings in a card grid
- Show meeting status (Finalized or Pending)
- Display proposed dates (up to 2 with overflow indicator)
- Show location and meeting link if available
- Visual distinction between finalized and pending meetings:
  - **Green badge** = Finalized (final date locked)
  - **Teal badge** = Pending (awaiting responses)
- Click to view & respond to a meeting

**API Endpoints Used:**
- `GET /api/groups` - Fetch user's project groups
- `GET /api/meetings/group/{groupId}` - Get meetings for a group

---

### 2. **CreateMeeting.jsx** - Schedule a New Meeting
Create a new meeting with proposed dates for group members to vote on.

**Features:**
- Group selection dropdown
- Meeting title input
- Optional location field
- Optional meeting link (Zoom, Teams, Google Meet, etc.)
- Add multiple proposed dates with date + time picker
- Visual list of added dates with delete option
- Form validation with error messages
- Success notification with redirect

**Form Validation:**
- ✓ Group selection required
- ✓ Meeting title required
- ✓ At least one proposed date required
- ✓ No duplicate dates allowed

**API Endpoints Used:**
- `GET /api/groups` - Fetch user's groups
- `POST /api/meetings` - Create new meeting

---

### 3. **MeetingDetails.jsx** - View & Respond
View meeting details, submit availability, and finalize meeting time.

**Features:**
- Display meeting title and status badge
- Show location and meeting link
- **Date Selection:**
  - Click to select available dates
  - Visual checkmark when selected
  - Real-time vote count for each date
  - Display votes from other participants
- Submit availability button
- Finalize meeting (locks best time)
- View best time summary (most votes)
- Response statistics

**Workflow:**
1. Group member views proposed dates
2. Selects all dates they're available
3. Submits availability
4. System tallies votes for each date
5. Meeting organizer finalizes best time
6. Final time is locked and displayed

**API Endpoints Used:**
- `GET /api/meetings/{id}` - Get meeting details
- `GET /api/meetings/{id}/summary` - Get availability summary (vote counts)
- `POST /api/meetings/{id}/availability` - Submit user's available dates
- `PUT /api/meetings/{id}/finalize` - Finalize meeting time (best voted date)

---

## Routes

```
/module3-meetings              → MeetingList (Browse all meetings)
/module3-meetings/create       → CreateMeeting (Schedule new meeting)
/module3-meetings/:meetingId   → MeetingDetails (View & respond)
```

## Data Flow

```
User selects group
       ↓
View available meetings
       ↓
Choose meeting to respond to
       ↓
Select available dates
       ↓
Submit availability
       ↓
System counts votes
       ↓
Organizer finalizes meeting
       ↓
Final time locked & displayed
```

## Design & Styling

**Color Scheme (Module 2 Match):**
- **Background**: `#090e17` (Very dark blue)
- **Cards**: `#121826` (Slightly lighter)
- **Accent**: `#00d09c` (Bright teal)
- **Success/Finalized**: Green tones
- **Text**: white and gray-300

**Visual Elements:**
- Rounded corners: `2rem`, `2.5rem`
- Smooth transitions on all interactions
- Glow effects on accent colors
- Responsive grid layouts
- Icons from Lucide React

## Icons Used

- `Calendar` - Dates and times
- `MapPin` - Physical location
- `Link` - Meeting links
- `Users` - Group members
- `CheckCircle` - Finalized status
- `Plus` - Add action
- `ChevronLeft/Right` - Navigation
- `Loader2` - Loading state
- `AlertCircle` - Errors
- `X` - Close/remove

## Key Interactions

### Adding Proposed Dates
1. Select date from date picker
2. Select time from time picker
3. Click "Add" button
4. Date appears in list
5. Can remove by clicking X

### Submitting Availability
1. Click on date to select it (checkbox shows)
2. Select all available dates
3. Click "Submit My Availability"
4. Availability is recorded
5. Vote counts update in real-time

### Finalizing Meeting
1. Organizer reviews vote counts
2. Clicks "Finalize Meeting Time"
3. System selects best time (most votes)
4. Final date is locked
5. All participants see confirmed time

## Error Handling

- **Network errors**: Display user-friendly messages
- **Validation errors**: Highlight required fields
- **API errors**: Show error messages from backend
- **Loading states**: Display loading spinners during fetch

## State Management

Components use React hooks:
- `useState` - Form data, UI state, loaded data
- `useEffect` - Fetch data on mount, refetch after actions
- `useParams` - Get meetingId from URL
- `useNavigate` - Handle navigation

## Authentication

All API requests include Bearer token:
```javascript
headers: { 'Authorization': `Bearer ${token}` }
```

Token retrieved from `localStorage.accessToken`

## Responsive Design

- **Mobile**: Single column, full-width cards
- **Tablet** (md): Two columns
- **Desktop** (lg): Three columns, sidebar layout
- All form inputs are full-width and touch-friendly

## Future Enhancements

- Calendar view of all meetings
- Conflict detection (warn if person unavailable)
- Meeting notifications/reminders
- Export meeting invites
- Recurring meetings
- Email notifications of finalized times
- Meeting history and past meeting archive
- RSVP confirmations after finalization
