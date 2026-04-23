# Milestone Tracker - Quick Reference Guide

## 📋 Component Overview

### MilestoneList - Management Interface
**Route**: `/module3-milestones/:projectId`

Primary interface for managing project milestones with full CRUD operations.

```
┌─────────────────────────────────────────────────┐
│           MILESTONE LIST INTERFACE              │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Create New Milestone Button]                 │
│                                                 │
│  ┌──────────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Status Filter│ │Sort By   │ │ Statistics │  │
│  └──────────────┘ └──────────┘ └────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 📌 Milestone 1                          │   │
│  │ Status: In Progress  Progress: 75%     │   │
│  │ Start: Apr 1  Due: Apr 30  18 Days     │   │
│  │ [Edit] [Delete]                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 📌 Milestone 2                          │   │
│  │ Status: Not Started  Progress: 0%      │   │
│  │ Start: May 1  Due: May 31  Overdue ⚠  │   │
│  │ [Edit] [Delete]                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### MilestoneTimeline - Visual Timeline
**Route**: `/module3-milestones-timeline/:projectId`

Chronological visualization of milestones grouped by month.

```
┌─────────────────────────────────────────────────┐
│         PROJECT TIMELINE INTERFACE              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Apr 1 ───────────────────► May 31            │
│  3 Milestones                                  │
│                                                 │
│  ═══ APRIL 2024 ═══                            │
│      ●                                         │
│      │ Phase 1 - Development                  │
│      │ In Progress | 75% ████████░░           │
│      │ Start: Apr 1  Due: Apr 15               │
│      │ 18 days remaining                      │
│      │                                         │
│      ●                                         │
│      │ Phase 1 QA                              │
│      │ Not Started | 0% ░░░░░░░░░░            │
│      │ Start: Apr 16  Due: Apr 30              │
│      │ Overdue by 2 days ⚠                    │
│      │                                         │
│  ═══ MAY 2024 ═══                              │
│      ●                                         │
│      │ Phase 2 - Deployment                   │
│      │ Completed | 100% ███████████           │
│      │ Start: May 1  Due: May 15               │
│      │ Completed                               │
│      │                                         │
└─────────────────────────────────────────────────┘
```

## ✅ Validation Rules

### Form Field Validation

| Field | Requirement | Error Message | Example |
|-------|-------------|---------------|---------|
| **Title** | Required, ≤150 chars | "Milestone title is required" OR "Max 150 characters" | "Phase 1 Complete" |
| **Start Date** | Required | "Start date is required" | 2024-04-01 |
| **Due Date** | Required, ≥ Start Date | "Due date is required" OR "Due date cannot be before start date" | 2024-04-30 |
| **Description** | Optional, ≤1000 chars | "Max 1000 characters" | "Complete initial dev" |
| **Status** | Enum (4 options) | Auto-selected | IN_PROGRESS |
| **Progress** | 0-100 range | "Progress must be 0-100" | 75 |

### Real-Time Validation

```javascript
// Title
✓ "Phase 1 Complete" (25/150 characters)
✗ "" (required)
✗ "Very long title..." (exceeds 150)

// Dates
✓ Start: 2024-04-01, Due: 2024-04-30 ✓
✗ Start: 2024-04-30, Due: 2024-04-01 ✗ (invalid range)
✗ Start: [empty], Due: 2024-04-30 ✗ (missing start)

// Progress
✓ 75% (valid)
✗ 150% (exceeds max)
✗ -10% (below min)
```

## 🎨 Color System

### Status Indicators

| Status | Color Code | Tailwind | Usage |
|--------|-----------|----------|-------|
| **NOT_STARTED** | gray | gray-500/15 | New milestones |
| **IN_PROGRESS** | teal | #00d09c/15 | Active work |
| **ON_HOLD** | yellow | yellow-500/15 | Paused work |
| **COMPLETED** | green | green-500/15 | Finished |

### Alert Colors

| Alert | Color Code | Tailwind | Condition |
|-------|-----------|----------|-----------|
| **Overdue** | red | red-500/15 | Due date < today |
| **Due Soon** | yellow | yellow-500/15 | 1-7 days left |
| **Success** | green | green-500/15 | Operation success |
| **Error** | red | red-500/15 | Operation failed |

### UI Colors

```css
Primary Accent:     #00d09c (Bright Teal)
Accent Hover:       #00e6ae (Lighter Teal)
Background:         #090e17 (Very Dark Blue)
Surface:            #121826 (Dark Blue)
Border:             gray-800 (Dark Gray)
Text Primary:       white
Text Secondary:     gray-300
Text Tertiary:      gray-400
```

## 📊 Features Breakdown

### MilestoneList Operations

#### Create
```jsx
<button className="bg-[#00d09c] ...">+ New Milestone</button>
// Opens modal form with all validation
```

#### Read
```jsx
// Automatically fetches and displays all milestones
GET /api/module3/milestones/project/{projectId}
// Displays in filtered/sorted list
```

#### Update
```jsx
// Click edit button on milestone card
// Modal opens with pre-filled data
PUT /api/module3/milestones/{id}
// Validates before submitting
```

#### Delete
```jsx
// Click delete button on milestone card
// Asks for confirmation
DELETE /api/module3/milestones/{id}?userId={userId}
// Card removed from list
```

### Filtering & Sorting

#### Filters
```javascript
filterStatus = [
  'ALL',           // Show all
  'NOT_STARTED',   // Not started yet
  'IN_PROGRESS',   // Currently working
  'COMPLETED',     // Finished
  'ON_HOLD'        // Paused/deferred
]
```

#### Sort Options
```javascript
sortBy = [
  'dueDate',       // Earliest due first
  'progress',      // Highest progress first
  'status'         // Alphabetical status
]
```

### Summary Statistics

```javascript
{
  totalMilestones: 5,       // All milestones
  completedMilestones: 2,   // Status = COMPLETED
  overdueMilestones: 1,     // Due < today
  upcomingMilestones: 2,    // Due <= 7 days
  overallProgressPercentage: 55.2  // Avg progress
}
```

## 🔌 API Integration

### Base URL
```
http://localhost:8080/api/module3
```

### Required Headers
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
}
```

### Key Endpoints

#### List Milestones
```
GET /milestones/project/{projectId}
Response: List<MilestoneResponse>
```

#### Create Milestone
```
POST /milestones
Body: {
  projectId: 1,
  title: "Phase 1",
  description: "...",
  startDate: "2024-04-01",
  dueDate: "2024-04-30",
  status: "NOT_STARTED",
  progressPercentage: 0,
  userId: 1
}
Response: MilestoneResponse
```

#### Update Progress
```
PATCH /milestones/{id}/progress
Body: { progressPercentage: 75 }
Response: MilestoneResponse
```

#### Get Timeline
```
GET /milestones/project/{projectId}/timeline
Response: {
  milestones: [...],
  projectStartDate: "2024-04-01",
  projectEndDate: "2024-05-31",
  projectName: "Project X"
}
```

## 🚀 Getting Started

### 1. Access Milestones
```
Navigate to: /module3-milestones/1
             (replace 1 with project ID)
```

### 2. Create a Milestone
- Click "New Milestone" button
- Fill in required fields (title, start date, due date)
- Select status and progress
- Click "Create Milestone"

### 3. View Timeline
```
Navigate to: /module3-milestones-timeline/1
             (replace 1 with project ID)
```

### 4. Update Milestone
- Hover over milestone card
- Click "Edit" icon
- Modify fields
- Click "Update Milestone"

### 5. Delete Milestone
- Hover over milestone card
- Click "Delete" icon
- Confirm deletion

## 🔍 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Form won't submit | Validation error | Check red error messages |
| API error 401 | Missing auth token | Ensure token in localStorage |
| API error 404 | Project not found | Verify projectId in URL |
| Data not loading | Network error | Check backend connection |
| Colors look wrong | CSS not loaded | Clear browser cache |

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (full width)

## ⚡ Performance Tips

1. **Filtering**: Changes immediately on client
2. **Sorting**: Sorted in-memory, no API call
3. **Progress Bar**: Visual feedback while updating
4. **Lazy Loading**: Timeline loads on demand
5. **Caching**: Summary cached during session

## 🧪 Test Scenarios

```javascript
✅ Create milestone with all fields
✅ Create milestone with missing title (shows error)
✅ Edit milestone and update progress
✅ Delete milestone with confirmation
✅ Filter by each status type
✅ Sort by all options
✅ View timeline for project
✅ Verify color consistency
✅ Test on mobile (responsive)
✅ Verify error handling
```
