# Module 3 - Project Milestone Tracker Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND APPLICATION                     │
│                     (React + Vite)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MODULE 3 COMPONENTS                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ ProjectList  │  │ KanbanBoard  │  │ MilestoneList ✨  │  │
│  │              │  │              │  │ (NEW)             │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ EventList    │  │ MeetingList  │  │ MilestoneTimeline │  │
│  │              │  │              │  │ (NEW)             │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND JAVA API                           │
│                  (Spring Boot + JPA)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐     │
│  │ MilestoneController  │      │ ProjectController    │     │
│  │                      │      │                      │     │
│  │ POST /milestones     │      │ GET /projects/{id}   │     │
│  │ GET /milestones/{id} │      │ PUT /projects/{id}   │     │
│  │ PUT /milestones/{id} │      │ DELETE /projects/{id}│     │
│  │ DELETE /milestones   │      └──────────────────────┘     │
│  └──────────────────────┘                                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            DATABASE (PostgreSQL)                      │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │   projects   │  │  milestones  │  │   tasks     │ │   │
│  │  │              │  │              │  │             │ │   │
│  │  │ id, name,    │  │ id, title,   │  │ id, title,  │ │   │
│  │  │ description, │  │ description, │  │ description,│ │   │
│  │  │ startDate,   │  │ startDate,   │  │ status,     │ │   │
│  │  │ endDate,     │  │ dueDate,     │  │ priority,   │ │   │
│  │  │ creator_id,  │  │ status,      │  │ dueDate,    │ │   │
│  │  │ team_id      │  │ progress%,   │  │ position    │ │   │
│  │  │              │  │ assigned_to  │  └─────────────┘ │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Flow

### MilestoneList Component Flow

```
┌─────────────────────────────┐
│   MilestoneList.jsx         │
│   (Main Management UI)      │
└────────────┬────────────────┘
             │
    ┌────────┴────────┬────────────┬────────────┐
    ↓                 ↓            ↓            ↓
  CREATE            READ         UPDATE       DELETE
    │                 │            │            │
    ├─Validation─────┤            │            │
    │                 │            │            │
    └─→ POST API     │            │            │
        /milestones  │            │            │
                     │            │            │
              GET API──────────────┤            │
              /milestones/project  │            │
                                   │            │
                            PUT API─────────────┤
                            /milestones/{id}   │
                                              │
                                      DELETE API─→ Confirm
                                      /milestones/{id}
```

### Data Flow

```
User Input (Form)
      ↓
Validation Layer (Client-side)
      ├─ Title validation (required, max 150 chars)
      ├─ Date validation (start ≤ due)
      ├─ Progress validation (0-100)
      ├─ Description validation (max 1000 chars)
      └─ Status validation (enum check)
      ↓
API Request (HTTP)
      ↓
Backend Validation
      ├─ @Valid annotations
      ├─ Business logic validation
      └─ Authorization checks
      ↓
Database Operation
      ↓
Response Processing
      └─ Error/Success Message
      └─ UI State Update
```

## Validation Layers

### Client-Side Validation (MilestoneList.jsx)

```javascript
validateForm() {
  // Title validation
  - Not empty
  - Max 150 characters
  
  // Date validation
  - Start date required
  - Due date required
  - Due date >= Start date
  
  // Progress validation
  - Range: 0-100
  
  // Description validation
  - Max 1000 characters
}
```

### Server-Side Validation (Backend)

```java
@MilestoneRequest {
  @NotNull(message = "Project ID is required")
  private Long projectId;

  @NotBlank(message = "Milestone title is required")
  @Size(max = 150, message = "Title must not exceed 150 characters")
  private String title;

  @NotNull(message = "Start date is required")
  private LocalDate startDate;

  @NotNull(message = "Due date is required")
  private LocalDate dueDate;
}
```

## Integration Steps

### 1. **Component Setup** ✅ (Already Done)
- Created `MilestoneList.jsx` with full CRUD
- Created `MilestoneTimeline.jsx` with visual timeline
- Updated `index.js` exports
- Added routes in `App.jsx`

### 2. **Navigation Integration**
Add links to Milestone Tracker in project cards:

```jsx
// In ProjectList.jsx
<button 
  onClick={() => navigate(`/module3-milestones/${project.id}`)}
  className="... teal-button ..."
>
  View Milestones
</button>

<button 
  onClick={() => navigate(`/module3-milestones-timeline/${project.id}`)}
  className="... teal-button ..."
>
  View Timeline
</button>
```

### 3. **Authentication Setup**
Ensure the following are in localStorage:
```javascript
localStorage.setItem('userId', userId);
localStorage.setItem('authToken', token);
```

### 4. **API Configuration**
Backend must be running on:
```
http://localhost:8080
```

## Color Consistency

### Theme Colors Used

| Component         | Color Code | Usage                    |
|-------------------|-----------|--------------------------|
| Primary Accent    | #00d09c   | Buttons, highlights      |
| Hover State       | #00e6ae   | Button hover, active     |
| Background        | #090e17   | Page background          |
| Surface           | #121826   | Cards, inputs            |
| Success           | green-400 | Completed status         |
| Warning           | yellow-400| Upcoming/due soon        |
| Error             | red-400   | Overdue, delete          |
| Border            | gray-800  | Card borders             |
| Text Primary      | white     | Primary text             |
| Text Secondary    | gray-300  | Secondary text           |

### Tailwind Classes Used

```css
/* Backgrounds */
.bg-[#090e17]
.bg-[#121826]
.bg-[#00d09c]
.bg-gray-800/50

/* Text Colors */
.text-white
.text-gray-400
.text-[#00d09c]
.text-red-400

/* Borders */
.border-gray-800
.border-[#00d09c]/40

/* Shadows */
.shadow-[0_8px_25px_rgba(0,208,156,0.15)]
```

## Features Summary

### MilestoneList Features
✅ Create new milestones with validation
✅ Edit existing milestones
✅ Delete milestones with confirmation
✅ Filter by status
✅ Sort by due date, progress, or status
✅ Progress tracking with visual bars
✅ Deadline tracking
✅ Overdue/upcoming alerts
✅ Summary statistics
✅ Responsive design

### MilestoneTimeline Features
✅ Chronological timeline view
✅ Monthly grouping
✅ Visual status indicators
✅ Progress visualization
✅ Days remaining display
✅ Interactive hover effects
✅ Project date range display

## API Endpoints Reference

### All endpoints follow this pattern:
```
BASE_URL: http://localhost:8080/api/module3
```

### Milestone Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /milestones | Create milestone |
| GET | /milestones/{id} | Get milestone details |
| PUT | /milestones/{id} | Update milestone |
| DELETE | /milestones/{id}?userId=X | Delete milestone |
| GET | /milestones/project/{id} | Get all milestones for project |
| GET | /milestones/project/{id}/timeline | Get timeline view |
| GET | /milestones/project/{id}/summary | Get progress summary |
| PATCH | /milestones/{id}/progress | Update progress |
| GET | /milestones/project/{id}/upcoming?days=7 | Get upcoming deadlines |

## Error Handling

### Common Error Scenarios

1. **Validation Errors**
   - Empty title → "Milestone title is required"
   - Invalid dates → "Due date cannot be before start date"
   - Out of range progress → "Progress must be between 0 and 100"

2. **Authorization Errors**
   - Missing token → Redirect to login
   - Unauthorized user → "Only team members can..."

3. **Network Errors**
   - No response → "Error fetching milestones: ..."
   - Invalid response → Error message displayed

4. **Business Logic Errors**
   - Milestone not found → "Resource not found"
   - Invalid project → "Project not found"

## Testing Recommendations

### Unit Tests
- Form validation logic
- Date comparison functions
- Status color mapping
- Days remaining calculation

### Integration Tests
- CRUD operations
- API communication
- Error handling
- Data fetching and rendering

### E2E Tests
- Complete workflow (create → read → update → delete)
- Filter and sort operations
- Timeline navigation
- Responsive design

## Performance Considerations

### Optimization Features
- Lazy loading milestones
- Memoized calculations (grouping, sorting)
- Efficient re-renders
- Minimal state updates
- Optimistic UI updates

### Best Practices
- Batch API calls where possible
- Cache timeline data
- Virtual scrolling for large lists
- Debounce filter/sort changes

## Deployment Checklist

- [ ] All API endpoints accessible
- [ ] Environment variables configured
- [ ] Auth tokens properly set
- [ ] Database migrations applied
- [ ] Color palette finalized
- [ ] Responsive design tested
- [ ] Error messages reviewed
- [ ] Loading states working
- [ ] Form validation complete
- [ ] Browser compatibility verified
