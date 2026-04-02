# Module 3 Frontend Architecture

## Component Hierarchy

```
App.jsx (Router)
├── /module3-projects
│   └── ProjectList.jsx
│       └── Create Project Modal
│           └── Validation
│
├── /module3-projects/:projectId
│   └── KanbanBoard.jsx
│       ├── Project Header
│       ├── Create Task Modal
│       │   └── Validation
│       └── Kanban Columns (3)
│           ├── Todo Column
│           │   └── Task Cards (Draggable)
│           ├── InProgress Column
│           │   └── Task Cards (Draggable)
│           └── Done Column
│               └── Task Cards (Draggable)
│
├── /module3
│   └── EventList.jsx
│       ├── Event Cards
│       └── Search & Filter
│
├── /module3/create-event
│   └── CreateEvent.jsx
│       └── DatePicker & TimePicker
│           └── Validation
│
├── /module3-meetings
│   └── MeetingList.jsx
│       └── Meeting Cards
│
├── /module3-meetings/create
│   └── CreateMeeting.jsx
│       ├── DatePicker & TimePicker
│       └── Validation
│
└── /module3-meetings/:meetingId
    └── MeetingDetails.jsx
```

## Data Flow Diagram

```
User Actions
    ↓
Component State (useState)
    ↓
Validation (validateForm)
    ↓
API Request (fetch)
    ↓
Backend Processing
    ↓
Response Handling
    ↓
State Update
    ↓
Re-render UI
```

## Validation Flow

```
Form Input
    ↓
onChange Handler (Clear error)
    ↓
Submit Click
    ↓
validateForm()
    ├─ Check field requirements
    ├─ Check field lengths
    ├─ Check formats (URL, date)
    ├─ Check business rules (date ranges, etc)
    └─ Return errors
    ↓
if (errors) {
    ├─ Display error messages
    ├─ Highlight invalid fields
    └─ Prevent submission
} else {
    ├─ Make API request
    ├─ Show loading state
    └─ Handle response
}
```

## Color System

```
Primary Accent: #00d09c
├── Light: #00d09c (100%)
├── Medium: #00d09c/50
├── Dim: #00d09c/20
├── Hover: #00e6ae
└── Shadow: rgba(0,208,156,0.2)

Dark Theme:
├── Background: #090e17
├── Surface: #121826
├── Border: #gray-800 (gray-800/50)
├── Text Primary: white
├── Text Secondary: gray-300
├── Text Tertiary: gray-400
└── Text Muted: gray-500/600

Status Colors:
├── Success: green-400/500
├── Warning: yellow-400/500
├── Error: red-400/500
├── Info: blue-400/500
└── Override: orange-400/500
```

## State Management Pattern

Each component uses:
- `useState` for form data
- `useState` for loading states
- `useState` for error messages
- `useState` for UI states (modal open/close)
- `useEffect` for data fetching
- `useParams` for route parameters
- `useNavigate` for navigation

Example:
```jsx
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [formErrors, setFormErrors] = useState({});
```

## Form Validation Pattern

All forms follow this validation pattern:

```jsx
const validateForm = () => {
  const newErrors = {};
  
  // Check each field
  if (!field.trim()) {
    newErrors.field = 'Field is required';
  } else if (field.length < minLength) {
    newErrors.field = `Min ${minLength} characters`;
  } else if (field.length > maxLength) {
    newErrors.field = `Max ${maxLength} characters`;
  }
  
  // Check complex validations
  if (dateField && new Date(dateField) < new Date()) {
    newErrors.dateField = 'Date must be in future';
  }
  
  setFormErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## API Communication Pattern

All API calls follow this pattern:

```jsx
const fetchData = async () => {
  try {
    setLoading(true);
    setError('');
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      setData(data.data);
    } else {
      setError('Failed to load data');
    }
  } catch (err) {
    setError('Error loading data');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

## Modal Pattern

All modals follow this pattern:

```jsx
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-[#121826] rounded-[2rem] border border-gray-800 max-w-md w-full p-8">
      {/* Form content */}
    </div>
  </div>
)}
```

## Responsive Breakpoints

Using Tailwind CSS:
- `sm`: 640px (not used, mobile-first)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- Default: Mobile (0-639px)

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## Key Features Implementation

### Drag and Drop
```jsx
const handleDragStart = (e, task) => setDraggedTask(task);
const handleDragOver = (e) => e.preventDefault();
const handleDrop = (e, status) => {
  // Update task status via API
  // Refresh kanban board
};
```

### Date Picker Component
```jsx
<DatePicker 
  value={formData.date}
  onChange={(date) => setFormData({...formData, date})}
/>
```

### Time Picker Component
```jsx
<TimePicker 
  value={formData.time}
  onChange={(time) => setFormData({...formData, time})}
/>
```

### Auto-loading on Mount
```jsx
useEffect(() => {
  fetchData();
}, [projectId]); // Re-fetch when parameter changes
```

## Performance Optimizations

1. **Lazy State Updates** - Clear errors only when needed
2. **Conditional Rendering** - Show content only when loaded
3. **Memoized Navigation** - useNavigate for routing
4. **Optimistic UI** - Show loading states
5. **Error Boundaries** - Graceful error handling

## Accessibility Features

- Semantic HTML elements
- Proper label associations
- ARIA attributes for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Loading state announcements
- Error message associations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API
- LocalStorage for token
- Tailwind CSS v4

## Security Measures

- Authorization header with Bearer token
- Sensitive data not logged
- Input sanitization (trim/validation)
- CSRF prevention (backend handles)
- Password fields not displayed
- Session stored in localStorage
