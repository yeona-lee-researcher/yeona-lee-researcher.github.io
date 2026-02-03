# 🎊 Festory Project - Complete Technical Stack & Architecture Analysis

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Technology Stack](#core-technology-stack)
3. [Development Environment & Build Tools](#development-environment--build-tools)
4. [Key Libraries & Packages](#key-libraries--packages)
5. [Page-by-Page Technical Analysis](#page-by-page-technical-analysis)
6. [Component Technical Analysis](#component-technical-analysis)
7. [State Management & Data Flow](#state-management--data-flow)
8. [Styling Strategy](#styling-strategy)
9. [API & External Service Integration](#api--external-service-integration)
10. [Routing Architecture](#routing-architecture)
11. [Project Structure & Architecture](#project-structure--architecture)

---

## Project Overview

**Festory** is an AI-powered festival recommendation platform that analyzes user preferences to suggest personalized festivals through a web application.

- **Project Name**: Festory (Your Festival, Your Story)
- **Development Period**: 2024
- **Key Features**: AI festival recommendations, taste tests, schedule management, map-based exploration, review system
- **Target Users**: Festival enthusiasts of all ages

---

## Core Technology Stack

### 1. **Frontend Framework**
- **React 19.2.0** (Latest version)
  - Functional component-based development
  - Hooks utilization (useState, useEffect, useMemo, useRef, useCallback)
  - React.StrictMode for early issue detection

### 2. **Build Tool**
- **Vite 7.2.4** (Ultra-fast bundler)
  - ES Modules-based fast dev server
  - Hot Module Replacement (HMR) support
  - React optimization with @vitejs/plugin-react 5.1.1
  - Path alias configuration (`@` → `./src`)

### 3. **Styling**
- **Tailwind CSS 4.1.18** (Utility-First CSS framework)
  - PostCSS 8.5.6 integration
  - Browser compatibility with Autoprefixer 10.4.23
  - Dark Mode support (class-based)
  - Custom theme extensions (colors, fonts, border-radius)
- **Inline Styles** (Dynamic styling)
  - Fine-grained component-level style control
  - Interactive effects (Hover/Focus)

### 4. **State Management**
- **Zustand 5.0.10** (Lightweight state management library)
  - localStorage auto-sync with Persist middleware
  - Centralized store pattern
  - Minimal re-rendering optimization

### 5. **Routing**
- **React Router DOM 7.12.0**
  - BrowserRouter-based SPA routing
  - useNavigate, useLocation Hooks
  - Dynamic routing and state passing

---

## Development Environment & Build Tools

### **Package Manager**
- **npm** (Node Package Manager)

### **Development Scripts**
```json
{
  "dev": "vite",              // Dev server (http://localhost:5173)
  "build": "vite build",      // Production build (creates dist folder)
  "lint": "eslint .",         // ESLint code inspection
  "preview": "vite preview"   // Build preview
}
```

### **Code Quality Tools**
- **ESLint 9.39.1**
  - @eslint/js 9.39.1
  - eslint-plugin-react-hooks 7.0.1 (Hook rules validation)
  - eslint-plugin-react-refresh 0.4.24 (Fast Refresh support)
  - globals 16.5.0 (Global variable definitions)
  
### **Type Checking (Optional)**
- @types/react 19.2.5
- @types/react-dom 19.2.3
- Type hints via JSDoc comments without TypeScript

### **Vite Configuration**
```javascript
// vite.config.js
{
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // Absolute path imports
    }
  }
}
```

---

## Key Libraries & Packages

### **UI/UX Libraries**
1. **Radix UI**
   - @radix-ui/react-slot 1.2.4
   - Accessibility-first Headless UI components
   - Shadcn/ui component system foundation

2. **Lucide React 0.562.0**
   - Icon library (Bell, User, MapPin, Calendar, etc.)
   - SVG-based lightweight icons

3. **FullCalendar**
   - @fullcalendar/react 6.1.20
   - @fullcalendar/daygrid 6.1.20 (Month view)
   - @fullcalendar/timegrid 6.1.20 (Time grid)
   - @fullcalendar/interaction 6.1.20 (Drag & drop)

### **Date/Time Handling**
- **date-fns 4.1.0**
  - Date formatting, calculations, comparisons
  - Tree-shakable (only used functions in bundle)
- **react-day-picker 9.13.0**
  - Date picker UI component

### **Map Services**
- **Google Maps API**
  - @googlemaps/js-api-loader 2.0.2
  - Places API (Place search, details)
  - Geocoding API (Address ↔ Coordinates conversion)
  - Markers, InfoWindow, distance calculation (Haversine formula)

### **OAuth Authentication**
1. **Google OAuth**
   - @react-oauth/google 0.13.4
   - Calendar API integration (read/write permissions)
   - gapi-script 1.2.0 (Google API client)

2. **Kakao OAuth**
   - REST API authentication
   - Kakao Developers app configuration

3. **Naver OAuth** (Planned)

### **Utilities**
- **clsx 2.1.1** + **tailwind-merge 3.4.0**
  - Conditional className merging
  - Tailwind class conflict resolution

- **class-variance-authority 0.7.1**
  - Component variant management

---

## Page-by-Page Technical Analysis

### 1. **LandingPage** (`/`)
**Purpose**: Impressive first experience and brand introduction on initial visit

**Technologies Used**:
- React Hooks: `useState`, `useEffect`, `useNavigate`
- HTML5 Video API (`<video>` tag)
- CSS Transitions (opacity fade-in/out)
- setTimeout-based timer management

**Implementation Details**:
```jsx
- Background video (beach.mp4) auto-play (autoPlay, loop, muted, playsInline)
- Text fade-in → 3s hold → fade-out → page fade-out → navigate to /home
- Page transition animation: opacity 2s ease-in-out
- Responsive fullscreen layout (100vw × 100vh)
```

**Page Flow**:
1. Page load → Text appears after 1s
2. Hold text for 3s
3. Text fade-out over 1.5s
4. Full page fade-out over 2s
5. Auto-redirect to /home

---

### 2. **Home** (`/home`)
**Purpose**: Main page for non-logged-in users, introducing key features

**Technologies Used**:
- React Router: `useNavigate`
- JSON data import (festivals.json)
- Custom component composition

**Implemented Components**:
```jsx
- Header_home: Non-logged-in header
- WeatherWidget: Real-time weather for 8 major cities (OpenWeather API)
- TownCard × 4: Popular festival cards (top 4 from festivals.json)
- TownDetailModal: Festival detail modal
- Video Background: Banner video
```

**Layout Structure**:
1. **Hero Banner**
   - Background video + gradient overlay
   - "Find your Golden Harmony" title
   - Login CTA button
   - Aspect ratio 16:6

2. **Main Content**
   - Max width 1600px, centered
   - Left: Weather widget (sticky position)
   - Right: Popular festivals 4-grid (2×2)

**Styling Features**:
- Linear gradient background (#FF5F33 → #EAB308)
- Box-shadow for depth
- Hover effect: transform: translateY(-4px)
- Border-radius 24px (smooth corners)

---

### 3. **After_Home** (`/after_home`)
**Purpose**: Personalized main page after login

**Differentiating Features**:
- User name display (from Zustand)
- "A Spoonful of Sunset" AI recommendation section
- "Trending Festivals" curation
- 1/3 probability Loading screen (UX effect)

**Technologies Used**:
- Zustand: `user`, `loginUser`, `clearTasteTestAnswers`
- Math.random() for probabilistic loading
- setTimeout-based 2-4s random delay

**Key Features**:
1. **AI Recommendation System**
   - Based on taste test results
   - Liked festival pattern analysis
   - Google Gemini AI integration (planned)

2. **Dynamic User Greeting**
   ```jsx
   const getUserName = () => {
     if (user?.name) return user.name;
     if (loginUser && loginUser !== "google") return loginUser;
     return "Member";
   };
   ```

---

### 4. **TasteTest** (`/tastetest`)
**Purpose**: Analyze user preferences through 7 questions

**Technologies Used**:
- React Hooks: `useState` (currentQuestion, selectedOptions)
- Zustand: `addTasteTestAnswer`, `clearTasteTestAnswers`
- Material Design Icons (icon field)

**Question Structure** (7 steps):
1. **Companion Selection** (Solo/Couple/Friends/Family/Pet)
2. **Atmosphere Preference** (Crowded/Quiet/Either)
3. **Important Elements** (Food/Performance/Tradition/Experience/Nature/Photo) - Max 2 selections
4. **Food Taste** (Traditional/Fusion/Street food/Fine dining/Either)
5. **Color Preference** (Vibrant/Pastel/Dark/Natural)
6. **Time Preference** (Morning/Day/Sunset/Night/Either)
7. **Participation Level** (Direct experience/Spectate/Photography/Rest)

**Answer Storage Format**:
```javascript
{
  questionIndex: 0,
  answerId: 1,
  tags: ["#solo"]
}
```

**UI Features**:
- Progress bar (top)
- Card selection UI (Material Icons + description)
- Multiple selection support (Question 3)
- Previous/Next buttons
- Navigate to `/testresult` on completion

**Styling**:
- Grid layout (2 or 3 columns)
- Hover effect: scale(1.02), increased shadow
- Selection: border color change (#FF5F33)
- Transition: all 0.2s ease

---

### 5. **Testresult** (`/testresult`)
**Purpose**: Display taste analysis results and personalized festival recommendations

**Technologies Used**:
- `useMemo` for analysis logic optimization
- Zustand: `tasteTestAnswers`, `setTasteType`
- Compass design visualization

**Analysis Algorithm**:
```javascript
const firstAnswer = tasteTestAnswers[0]?.answerId;

if (firstAnswer === 1) {
  type: "#Experience_Explorer"
} else if (firstAnswer === 2) {
  type: "#Party_Lover"
} else {
  type: "#Aesthetic_Artist"
}
```

**Result Screen Layout**:
1. **Left Panel (Sticky)**
   - User type (compass design)
   - Hashtags (#physical_activity, #traditional_vibes, etc.)
   - Description text
   - "Retake Test" button

2. **Right Panel**
   - **MAIN EVENT**: Top recommended festival (large card)
   - **NEARBY SPOT**: Surrounding tourist attractions
   - **Recommended Festivals List**: Match rate display (98%, 92%, 87%)

**Regional Nearby Spots Mapping**:
```javascript
const spotMap = {
  "Pyeongchang": { name: "Daegwallyeong Sheep Farm", description: "20 min drive" },
  "Gangneung": { name: "Gyeongpo Beach", description: "15 min drive" },
  // ... 20 regions
}
```

**Recommendation Logic**:
- Top 3 festivals from festivals.json
- Dynamic match rate calculation (98%, 92%, 87%)
- Auto-match nearby spots based on festival location

---

### 6. **Festival_List** (`/festivals`)
**Purpose**: Complete festival list and advanced filtering

**Technologies Used**:
- `useMemo` for filtering performance optimization
- CSS Grid responsive layout
- Regular expression date parsing

**Filter Options**:
1. **Region Filter** (Multiple selection)
   - Seoul, Busan, Daegu, Incheon, Gwangju, Daejeon, Ulsan, Sejong
   - Gyeonggi, Gangwon, Chungbuk, Chungnam, Jeonbuk, Jeonnam, Gyeongbuk, Gyeongnam, Jeju

2. **Duration Filter**
   - Single day (1 day)
   - Short-term (2-3 days)
   - Long-term (3-5 days)

3. **Price Filter**
   - Free
   - Paid

4. **Weekend Inclusion**

**Date Parsing Logic**:
```javascript
// "2024. 5. 14. ~ 5. 16." → { startDateTime, endDateTime }
// "2024. 5. 14. ~ 2025. 1. 10." → { startDateTime, endDateTime }
// "2024. 5. 14." → { startDateTime, endDateTime }
```

**Sort Options**:
- Name (alphabetical)
- Latest
- Popularity

**UI Features**:
- Accordion-style filter sections
- Selected filter badges
- Display total N festivals
- Card grid layout (4 columns)

---

### 7. **Calendar** (`/calendar`)
**Purpose**: Google Calendar integrated schedule management

**Technologies Used**:
- **FullCalendar React** (6.1.20)
  - dayGridPlugin (Month view)
  - timeGridPlugin (Week view)
  - interactionPlugin (Drag selection)
- **Google Calendar API**
  - OAuth 2.0 authentication
  - Events CRUD (read/write)
  - calendar.events Scope

**Key Features**:
1. **Google Login**
   ```javascript
   const SCOPES = "https://www.googleapis.com/auth/calendar.events";
   ```

2. **Add Schedule**
   - Modal opens on date/drag selection
   - Input title, description, start/end time
   - Actual insert to Google Calendar

3. **Edit/Delete Schedule**
   - Show details on event click
   - Edit/Delete buttons
   - Google Calendar API calls

4. **Save Festivals**
   - Right panel: Saved Festivals / Liked Festivals
   - Drag & drop to calendar
   - Save to Zustand (savedCalendarFestivals)

**FullCalendar Custom Styles**:
```css
.fc-event-title { text-align: center; }
.fc-daygrid-event { 
  border-radius: 8px;
  box-shadow: 3D effect;
}
.fc-day-today { 
  background: rgba(244,133,37,0.05);
}
```

**API Request Example**:
{% raw %}
```javascript
// Add schedule
fetch(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    summary: "Festival Title",
    description: "Festival Description",
    start: { dateTime: "2024-05-14T10:00:00+09:00" },
    end: { dateTime: "2024-05-14T18:00:00+09:00" }
  })
})
```
{% endraw %}

---

### 8. **Map** (`/map`)
**Purpose**: Google Maps-based festival location and nearby accommodation search

**Technologies Used**:
- **Google Maps JavaScript API**
  - Places Service (nearbySearch, getDetails)
  - Geocoder (Address → Coordinates)
  - Marker, InfoWindow
- **Haversine Formula** (Distance calculation)
- `useRef` for Map instance management

**Key Features**:
1. **Festival Location Display**
   - Search festival from festivals.json by pSeq
   - Address → Geocoding → Marker display

2. **Nearby Accommodation Search**
   - Places API nearbySearch
   - Within 2000m radius
   - Type: "lodging"

3. **Accommodation Details**
   - Places API getDetails
   - Query by place_id
   - Rating, reviews, price level, photos

4. **Sort Options**
   - Distance
   - Price ascending/descending
   - Rating ascending/descending

**Price Estimation Logic**:
```javascript
// Google price_level (0~4) → KRW estimation
function estimatedPriceFromLevel(priceLevel) {
  switch (priceLevel) {
    case 0: return 70000;
    case 1: return 90000;
    case 2: return 110000;
    case 3: return 140000;
    case 4: return 180000;
  }
}
```

**UI Layout**:
- Left: Map (600px fixed)
- Right: Accommodation list (scrollable)
- Marker click → InfoWindow display
- Accommodation card click → Expand details

---

### 9. **Plancuration** (`/Plancuration`)
**Purpose**: Integrated management of AI recommendations + user saved schedules

**Technologies Used**:
- Map marker clustering
- Drag & Drop (DnD)
- PlanGoogleMap custom component

**Page Layout**:
1. **AI Recommendation Section**
   - Google Gemini AI analysis
   - Taste-based 3 festivals (pSeq 4, 5, 6)
   - Card format display

2. **My Schedule Management**
   - Create trip (title, dates)
   - Add/delete festivals by day
   - Drag to change order

3. **Map Visualization**
   - Display festival markers for selected schedule
   - Color-coded by region
   - Route display (Polyline)

**Zustand Store Usage**:
```javascript
trips: [],                // Trip list
tripSchedules: {},        // { tripId: { 0: [festivals], 1: [festivals] } }
currentTripId: null,      // Currently selected trip
```

**Regional Coordinate Data**:
```javascript
const REGIONS = [
  { name: "Seoul", lat: 37.5665, lon: 126.9780 },
  { name: "Busan", lat: 35.1796, lon: 129.0756 },
  // ... 8 major cities
];
```

---

### 10. **Mypage** (`/mypage`)
**Purpose**: Member information and taste profile management

**Tab Structure**:
1. **My Info (myinfo)**
   - ID, email, name, nickname, phone, gender
   - Edit mode toggle
   - PRO MEMBER badge

2. **Liked Festivals (liked)**
   - Display likedFestivals array
   - Reuse TownCard component
   - Unlike feature

3. **My Reviews (reviews)**
   - Written reviews list
   - Rating, date, text
   - Edit/Delete features

4. **Taste Profile (taste)**
   - Compass design
   - User type (#Experience_Explorer, etc.)
   - Hashtags (#physical_activity, #traditional_vibes)
   - "Retake Test" button → Navigate to TasteTest

**Taste Type Information**:
```javascript
type 1: #Experience_Explorer
type 2: #Party_Lover
type 3: #Aesthetic_Artist
```

**User Info Priority**:
```javascript
user?.name || loginUser?.name || "Guest"
```

---

### 11. **Login** (`/login`)
**Purpose**: Provide various login methods

**Authentication Methods**:
1. **Standard Login**
   - ID/Password input
   - Validation (touched state)
   - Store user info in Zustand

2. **Google Login**
   - Using @react-oauth/google
   - useGoogleLogin Hook
   - Request Calendar API permissions
   - Store Access Token

3. **Kakao Login**
   - REST API method
   - OAuth 2.0 Authorization Code
   - Redirect URI: `/oauth/kakao/callback`
   - CSRF prevention (state parameter)

4. **Naver Login** (Planned)

**UI Features**:
- Gradient background (#fff9f2 → #ffd1a4)
- Unified social login button design
- Password show/hide toggle
- Sign-up link

**Kakao Login Flow**:
```javascript
1. Click Kakao button on /login
2. Redirect to Kakao auth page
3. Return to /oauth/kakao/callback after user consent
4. Obtain Authorization Code
5. Exchange for Access Token
6. Retrieve user info
7. Save to Zustand and navigate to /after_home
```

---

### 12. **Review** (`/review`)
**Purpose**: Write and manage festival visit reviews

**Technologies Used**:
- localStorage persistent storage
- Star rating system (1-5 stars)
- Media upload (images/videos)

**Key Features**:
1. **Write Review**
   - Select festival (from tripSchedules)
   - Select star rating (with Hover effect)
   - Text input
   - Attach photos/videos (FileReader API)

2. **Review List**
   - Display written review cards
   - Mock reviews (simulate other user reviews)
   - Calculate average rating

3. **Media Management**
   - Image preview
   - Delete files
   - Modal enlarged view

**Mock Review Generation**:
```javascript
const generateMockReviews = (festivalId) => {
  const names = ["Kim Minsu", "Lee Jieun", "Park Seojun", ...];
  const comments = ["Amazing festival!", ...];
  // Generate 3-7 random reviews
}
```

**Storage Format**:
```javascript
{
  id: "review_123",
  festivalId: 4,
  author: "Kim Festival",
  rating: 5,
  text: "Great!",
  mediaFiles: [{ name, url, type }],
  date: "2024-05-14T10:30:00"
}
```

---

### 13. **Loading** (`/loading`)
**Purpose**: Loading animation during page transitions

**Technologies Used**:
- CSS Keyframe Animation
- Lottie (optional)

**Animation Effects**:
- Spinner rotation
- Fade-in/out
- Progress bar (optional)

---

### 14. **Signup** (`/signup`)
**Purpose**: User registration

**Input Fields**:
- ID, password, password confirmation
- Name, nickname, email
- Phone, gender
- Terms agreement

**Validation**:
- Email format (regex)
- Password strength
- Required fields check

---

## Component Technical Analysis

### **Header** (After Login)
**Features**:
- Logo (home_logo.png)
- Navigation menu
  - FESTORIES (Festival list)
  - MAP (Map)
  - CALENDAR (Schedule)
  - AI PLAN (Schedule curation)
  - REVIEW (Reviews)
- Notifications (Bell icon)
  - Alerts for schedules within 3 days
  - Dropdown style
- My Page (User icon)

**Technologies Used**:
- Lucide React icons
- useLocation for current route highlighting
- useRef + useEffect for outside click detection
- Fetch trips data from Zustand

**Notification Logic**:
```javascript
// Check schedules within 3 days from today
const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
return diffDays >= 0 && diffDays <= 3;
```

---

### **Header_home** (Before Login)
**Differences**:
- Login/Sign-up buttons
- Simplified menu
- No notification feature

---

### **WeatherWidget**
**Feature**: Real-time weather for 8 major cities nationwide

**API**: OpenWeather API
{% raw %}
```javascript
const url = `https://api.openweathermap.org/data/2.5/weather
  ?lat=${lat}&lon=${lon}
  &appid=${apiKey}
  &units=metric
  &lang=kr`;
```
{% endraw %}

**Displayed Information**:
- Temperature (°C)
- Feels like temperature
- Weather description (Korean)
- Weather emoji (☀️, ☁️, 🌧️, etc.)
- Humidity, wind speed

**City List**:
```javascript
const REGIONS = [
  { name: "Seoul", lat: 37.5665, lon: 126.9780, region: "Gyeonggi" },
  { name: "Busan", lat: 35.1796, lon: 129.0756, region: "Gyeongsang" },
  // ... 8 cities
];
```

**Error Handling**:
- API key not set
- Network errors
- Invalid API key
- Detailed error messages

**UI Features**:
- Card format
- Hover: translateX(4px)
- Gradient accent color (#FF5F33)

---

### **TownCard**
**Purpose**: Festival information card component

**Props**:
```javascript
{
  festival: {
    pSeq,
    fstvlNm,
    ministry_title,
    ministry_date,
    ministry_region,
    ministry_image,
    opar, rdnmadr, lnmadr,
    fstvlStartDate, fstvlEndDate
  },
  onClick: () => void
}
```

**Displayed Information**:
- Festival image (with placeholder)
- Festival title
- Event period
- Region
- Like button
- Calendar save button

**Zustand Integration**:
- toggleLikeFestival
- toggleCalendarFestival
- Check isLiked, isCalendarSaved states

**Styling**:
- Aspect ratio 3:2 (image)
- Border-radius 16px
- Box-shadow
- Hover effect (scale, shadow)

---

### **TownDetailModal**
**Purpose**: Festival detail information modal

**Displayed Information**:
- Large image
- Title, subtitle
- Date and time, location
- Detailed description
- Address (road name/lot number)
- Google Map (GoogleMap component)
- Like/Save buttons
- Share button

**Technical Implementation**:
- Portal-style modal (z-index 9999)
- Close on backdrop click
- ESC key close (useEffect)
- Scroll Lock (body overflow hidden)

---

### **GoogleMap**
**Purpose**: Google Maps embedding component

**Props**:
```javascript
{
  latitude, longitude,
  rdnmadr, lnmadr,
  apiKey
}
```

**Features**:
- Display map with coordinates or address
- Geocoding (Address → Coordinates)
- Auto marker placement
- Center alignment

**Optimization**:
- Prevent duplicate loading with loadGoogleMaps utility
- Manage Map instance with useRef
- Prevent memory leaks with cleanup function

---

### **PlanGoogleMap**
**Purpose**: Dedicated map for Plan&Curation page

**Differences**:
- Multiple marker display
- Clustering
- Route display (Polyline)
- Color-coded by region

---

### **ChatBot**
**Purpose**: Accessible chatbot from all pages

**Display Position**:
- Fixed bottom right
- Excluded pages: /loading, /login, /signup

**UI Effects**:
- Float animation (3s repeat)
- Hover: scale(1.1)
- Tooltip display ("Find festivals perfect for you!!")
- Drop-shadow

**Image**:
- chatBot.png (mascot image)

**Future Integration**:
- Actual chatbot API (ChatGPT, Dialogflow, etc.)
- WebSocket real-time chat

---

### **UI Components (Shadcn/ui)**

#### **Button**
```javascript
// Using class-variance-authority
variants: {
  default, destructive, outline, secondary, ghost, link
}
sizes: {
  default, sm, lg, icon
}
```

#### **Card**
```javascript
<Card>
  <CardHeader>
    <CardTitle />
    <CardDescription />
  </CardHeader>
  <CardContent />
</Card>
```

#### **Calendar**
- Based on react-day-picker
- date-fns integration
- Multi-language support (Korean)
- Range selection available

---

## State Management & Data Flow

### **Zustand Store Structure**

```javascript
// useStore.js
{
  // User-related
  user: null,
  loginUser: null,
  loginType: 'local' | 'google' | 'kakao' | 'naver',
  
  // OAuth tokens
  googleAccessToken: null,
  kakaoAuthCode: null,
  
  // Festival-related
  selectedFestivalPSeq: null,
  likedFestivals: [],
  savedCalendarFestivals: [],
  
  // Taste test
  tasteTestAnswers: [],
  tasteType: 1 | 2 | 3,
  
  // Trip schedule
  selectedTravelDates: { start, end },
  trips: [{ id, title, start, end, region, days }],
  currentTripId: null,
  editingTripId: null,
  tripSchedules: {
    [tripId]: {
      [dayIndex]: [festival1, festival2, ...]
    }
  },
  
  // Review-related
  reviewFestival: null,
  reviewMode: 'add' | 'edit',
  selectedReview: null,
  
  // Actions
  setUser, clearUser,
  setLogin, clearLogin,
  toggleLikeFestival, isLiked,
  toggleCalendarFestival, isCalendarSaved,
  addTasteTestAnswer, clearTasteTestAnswers,
  setTasteType, clearTasteType,
  addTrip, updateTrip, deleteTrip,
  setCurrentTrip,
  addFestivalToDay, removeFestivalFromDay,
  updateDaySchedule,
  setReviewFestival, clearReviewFestival
}
```

### **Persist Configuration**
```javascript
persist(
  (set) => ({ ... }),
  {
    name: 'festory-storage',
    storage: localStorage,
    partialize: (state) => ({
      // Select only items to persist
    })
  }
)
```

### **Data Flow**

1. **User Authentication**
   ```
   Login page → setLogin(user, type) 
   → Save to Zustand 
   → Auto-sync to localStorage
   → Display user info on After_Home page
   ```

2. **Taste Test**
   ```
   TasteTest → addTasteTestAnswer(answer) 
   → Add to Zustand.tasteTestAnswers array
   → Analyze in Testresult
   → setTasteType(1|2|3)
   → Display in Mypage
   ```

3. **Festival Likes**
   ```
   TownCard heart click 
   → toggleLikeFestival(festival)
   → Toggle Zustand.likedFestivals
   → Display in Mypage likes
   → Display in Calendar right panel
   ```

4. **Schedule Management**
   ```
   Plancuration → addTrip({ title, start, end })
   → Add to Zustand.trips
   → addFestivalToDay(tripId, dayIndex, festival)
   → Update tripSchedules[tripId][dayIndex]
   → Display markers in PlanGoogleMap
   ```

---

## Styling Strategy

### **Tailwind CSS Configuration**

```javascript
// tailwind.config.js
{
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom colors
      colors: {
        background: "hsl(var(--background))",
        primary: "hsl(var(--primary))",
        // ... HSL variable-based
      },
      // Korean fonts
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', ...]
      },
      // Custom border-radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
}
```

### **CSS Variables** (index.css)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 15 80% 50%;  /* #FF5F33 */
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
}
```

### **Utility Functions**
```javascript
// lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

**Usage Example**:
```jsx
<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

### **Reasons for Using Inline Styles**
1. Handle dynamic values (props-based)
2. Complex CSS-in-JS logic
3. Animation control (JavaScript)
4. State-based styles (Hover, etc.)

**Example**:
{% raw %}
```jsx
<div
  style={{
    background: `linear-gradient(90deg, ${color1}, ${color2})`,
    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
  }}
  onMouseEnter={() => setIsHovered(true)}
/>
```
{% endraw %}

---

## API & External Service Integration

### **1. OpenWeather API**
**Purpose**: National weather information

**Endpoint**:
```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}&lon={lon}
  &appid={API_KEY}
  &units=metric
  &lang=kr
```

**Response Data**:
```json
{
  "main": {
    "temp": 15.3,
    "feels_like": 14.8,
    "humidity": 65
  },
  "weather": [{
    "main": "Clear",
    "description": "clear sky",
    "icon": "01d"
  }],
  "wind": {
    "speed": 3.5
  }
}
```

**Environment Variable**:
```
VITE_OPENWEATHER_API_KEY=your_api_key
```

---

### **2. Google Maps API**

#### **Maps JavaScript API**
**Loading Method**:
```javascript
// lib/googleMaps.js
import { Loader } from "@googlemaps/js-api-loader"

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"]
})

export async function loadGoogleMaps(options) {
  return await loader.load()
}
```

#### **Places API**
**Features**:
- nearbySearch (Search nearby places)
- getDetails (Place details)
- Autocomplete

**Usage Example**:
```javascript
placesService.nearbySearch({
  location: { lat, lng },
  radius: 2000,
  type: "lodging"
}, (results, status) => {
  if (status === "OK") {
    // Process results
  }
})
```

#### **Geocoding API**
**Address → Coordinates Conversion**:
```javascript
geocoder.geocode({ address: "Seoul Songpa-gu" }, (results, status) => {
  if (status === "OK") {
    const { lat, lng } = results[0].geometry.location
  }
})
```

---

### **3. Google Calendar API**

#### **OAuth 2.0 Authentication**
```javascript
import { useGoogleLogin } from "@react-oauth/google"

const googleLogin = useGoogleLogin({
  scope: "https://www.googleapis.com/auth/calendar.events",
  onSuccess: (tokenResponse) => {
    setGoogleAccessToken(tokenResponse.access_token)
  }
})
```

#### **Events API**
**Query Events**:
```
GET https://www.googleapis.com/calendar/v3/calendars/primary/events
  ?maxResults=50
  &orderBy=startTime
  &singleEvents=true
  &timeMin={ISO_DATE}
Authorization: Bearer {ACCESS_TOKEN}
```

**Add Event**:
```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events
Content-Type: application/json
Authorization: Bearer {ACCESS_TOKEN}

{
  "summary": "Festival Title",
  "description": "Festival Description",
  "start": { "dateTime": "2024-05-14T10:00:00+09:00" },
  "end": { "dateTime": "2024-05-14T18:00:00+09:00" },
  "location": "Seoul Songpa-gu"
}
```

**Update Event**:
```
PUT https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}
```

**Delete Event**:
```
DELETE https://www.googleapis.com/calendar/v3/calendars/primary/events/{eventId}
```

---

### **4. Kakao OAuth**

#### **Authentication Flow**
1. **Request Authorization Code**:
{% raw %}
```javascript
const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize
  ?client_id=${KAKAO_REST_KEY}
  &redirect_uri=${REDIRECT_URI}
  &response_type=code
  &state=${STATE}`;

window.location.assign(kakaoAuthUrl);
```
{% endraw %}

2. **Callback Handling** (OAuthKakaoCallback.jsx):
```javascript
const code = new URL(window.location.href).searchParams.get("code");
const state = new URL(window.location.href).searchParams.get("state");

// Validate state
if (state !== sessionStorage.getItem("kakao_oauth_state")) {
  alert("Invalid request.");
  return;
}
```

3. **Exchange Access Token**:
```
POST https://kauth.kakao.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id={REST_KEY}
&redirect_uri={REDIRECT_URI}
&code={CODE}
```

4. **Query User Info**:
```
GET https://kapi.kakao.com/v2/user/me
Authorization: Bearer {ACCESS_TOKEN}
```

---

### **5. Google Gemini AI** (Planned)
**Purpose**: AI festival recommendations

**Expected API**:
```javascript
// Gemini API call
const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": GEMINI_API_KEY
  },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: `User preferences: ${tasteTestAnswers}
               Liked festivals: ${likedFestivals}
               Please recommend.`
      }]
    }]
  })
});
```
{% endraw %}

---

## Routing Architecture

### **App.jsx**
```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/home" element={<Home />} />
  <Route path="/after_home" element={<After_Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/festivals" element={<Festival_List />} />
  <Route path="/map" element={<Map />} />
  <Route path="/calendar" element={<Calendar />} />
  <Route path="/Plancuration" element={<Plancuration />} />
  <Route path="/mypage" element={<Mypage />} />
  <Route path="/tastetest" element={<TasteTest />} />
  <Route path="/testresult" element={<Testresult />} />
  <Route path="/review" element={<Review />} />
  <Route path="/loading" element={<Loading />} />
  <Route path="/oauth/kakao/callback" element={<OAuthKakaoCallback />} />
  <Route path="/dateregistration" element={<Dateregistration />} />
</Routes>

{!isLandingPage && <ChatBot />}
```

### **Page Transition Flow**

1. **First Visit**:
   ```
   / (LandingPage) 
   → Auto transition (7.5s) 
   → /home
   ```

2. **Non-logged-in User**:
   ```
   /home 
   → /login 
   → /after_home
   ```

3. **Taste Test**:
   ```
   /tastetest 
   → /testresult 
   → /after_home (on retake)
   ```

4. **Schedule Management**:
   ```
   /calendar (View schedules)
   /Plancuration (AI recommendations + create schedules)
   /review (Write reviews)
   ```

---

## Project Structure & Architecture

### **Directory Structure**
```
PROJECT7/
├── public/
│   ├── fonts/
│   │   └── web/
│   │       └── static/
│   │           ├── pretendard.css
│   │           ├── pretendard-subset.css
│   │           └── woff2/
│   └── images/
│       ├── hotels/
│       └── resorts/
├── src/
│   ├── assets/
│   │   ├── beach.mp4
│   │   ├── wave30.mp4
│   │   ├── chatBot.png
│   │   └── home_logo.png
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.jsx
│   │   │   ├── calendar.jsx
│   │   │   └── card.jsx
│   │   ├── ChatBot.jsx
│   │   ├── GoogleMap.jsx
│   │   ├── PlanGoogleMap.jsx
│   │   ├── Header.jsx
│   │   ├── Header_home.jsx
│   │   ├── TownCard.jsx
│   │   ├── TownDetailModal.jsx
│   │   └── WeatherWidget.jsx
│   ├── data/
│   │   └── festivals.json
│   ├── lib/
│   │   ├── googleMaps.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── After_Home.jsx
│   │   ├── Calendar.jsx
│   │   ├── Festival_List.jsx
│   │   ├── Home.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Loading.jsx
│   │   ├── Login.jsx
│   │   ├── Map.jsx
│   │   ├── Mypage.jsx
│   │   ├── Plancuration.jsx
│   │   ├── Review.jsx
│   │   ├── Signup.jsx
│   │   ├── tastetest.jsx
│   │   └── Testresult.jsx
│   ├── store/
│   │   └── useStore.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

### **Architecture Patterns**

1. **Component-Based Design**
   - Reusable UI components (TownCard, Button, etc.)
   - Page components (Home, Calendar, etc.)
   - Layout components (Header, ChatBot)

2. **Unidirectional Data Flow**
   ```
   Zustand Store (Single Source of Truth)
   ↓
   React Components (UI)
   ↓
   User Actions
   ↓
   Zustand Actions (State Update)
   ```

3. **Presentational vs Container**
   - Presentational: TownCard (receives props only)
   - Container: Festival_List (Zustand integration)

4. **Code Splitting** (Vite auto)
   - Dynamic import (React.lazy)
   - Route-based splitting

---

### **Environment Variable Management**

**.env File**:
```env
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CALENDAR_ID=primary
VITE_OPENWEATHER_API_KEY=your_weather_key
VITE_KAKAO_REST_KEY=your_kakao_key
VITE_GEMINI_API_KEY=your_gemini_key
```

**Access Method**:
```javascript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## Performance Optimization Strategies

### **1. React Optimization**
- **useMemo**: Cache filtering, sorting calculations
  ```jsx
  const filteredFestivals = useMemo(() => {
    return festivals.filter(...)
  }, [festivals, filters])
  ```

- **useCallback**: Memoize event handlers
  ```jsx
  const handleClick = useCallback(() => {
    // ...
  }, [dependencies])
  ```

- **React.lazy** (Optional):
  ```jsx
  const Calendar = React.lazy(() => import('./pages/Calendar'))
  ```

### **2. Zustand Optimization**
- **Use Selectors**: Subscribe to only necessary state
  ```jsx
  const userName = useStore(state => state.user?.name)
  ```

- **Persist Partialize**: Save only necessary data
  ```javascript
  partialize: (state) => ({
    user: state.user,
    tasteType: state.tasteType
  })
  ```

### **3. Image Optimization**
- Native Lazy Loading
  ```jsx
  <img loading="lazy" src={...} />
  ```

- Placeholder images
  ```jsx
  src={festival.image || "https://via.placeholder.com/400x300"}
  ```

### **4. Bundle Size Optimization**
- Vite Tree Shaking (automatic)
- Individual date-fns imports
  ```javascript
  import { format } from 'date-fns'
  // ❌ import * as dateFns from 'date-fns'
  ```

### **5. API Request Optimization**
- Promise.all (Parallel requests)
  ```javascript
  const [weather1, weather2] = await Promise.all([
    fetch(url1),
    fetch(url2)
  ])
  ```

- Caching (Optional)
  - Consider SWR, React Query

---

## Accessibility

### **ARIA Attributes**
```jsx
<button aria-label="Like festival">❤️</button>
<nav aria-label="Main navigation">...</nav>
```

### **Keyboard Navigation**
- Tab order
- Enter/Space key support
- ESC to close modals

### **Semantic HTML**
```jsx
<header>, <nav>, <main>, <section>, <article>, <footer>
```

### **Color Contrast**
- WCAG AA level or higher
- Text contrast ratio 4.5:1

---

## Browser Compatibility

### **Target Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Polyfills**
- Autoprefixer (CSS)
- Vite automatic handling (ES6+)

### **Mobile Support**
- Responsive layout (Tailwind)
- Touch event support
- Viewport meta tag
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ```

---

## Security Considerations

### **1. API Key Protection**
- .env file (excluded from Git)
- Server-side proxy recommended

### **2. XSS Prevention**
- React automatic escaping
- Careful with dangerouslySetInnerHTML

### **3. CSRF Prevention**
- OAuth state parameter
  ```javascript
  const state = crypto.randomUUID()
  sessionStorage.setItem("kakao_oauth_state", state)
  ```

### **4. HTTPS**
- Required in production
- Prevent Mixed Content

---

## Deployment Strategy

### **Build Command**
```bash
npm run build
```

**Output**:
- `dist/` folder
- Optimized HTML, CSS, JS
- Gzip compression available

### **Deployment Platform Options**
1. **Vercel** (Recommended)
   - Auto-detect Vite
   - Environment variable management
   - CDN deployment

2. **Netlify**
   - Drag & Drop deployment
   - Serverless Functions

3. **GitHub Pages**
   - Free static hosting
   - gh-pages branch

4. **AWS S3 + CloudFront**
   - Full control
   - Cost-effective

### **Environment Variable Setup**
- Configure in Vercel/Netlify dashboard
- `VITE_*` prefix required

---

## Future Improvements

### **Technical Enhancements**
1. TypeScript migration
2. React Query adoption (server state management)
3. Storybook (component documentation)
4. Vitest (unit testing)
5. Playwright (E2E testing)
6. PWA (offline support)
7. i18n (multi-language support)

### **Feature Enhancements**
1. Real-time chat (WebSocket)
2. Push notifications (FCM)
3. Social sharing (Open Graph)
4. PDF download (schedule)
5. Voice search (Web Speech API)
6. AR features (WebXR)

---

## References

### **Official Documentation**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Router](https://reactrouter.com/)
- [FullCalendar](https://fullcalendar.io/docs/react)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [OpenWeather API](https://openweathermap.org/api)
- [Kakao Developers](https://developers.kakao.com/)

### **Utilities**
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)

---

## Summary

**Festory Project** is an **AI-powered festival recommendation platform** utilizing the latest frontend technology stack, featuring:

### **Core Technical Capabilities**
1. ✅ **React 19** Latest version
2. ✅ **Vite** Ultra-fast build tool
3. ✅ **Tailwind CSS** Utility-first styling
4. ✅ **Zustand** Lightweight state management
5. ✅ **Google Maps/Calendar API** External service integration
6. ✅ **OAuth 2.0** Social login implementation
7. ✅ **FullCalendar** Schedule management library
8. ✅ **OpenWeather API** Real-time weather data

### **Frontend Architecture**
- Component-based design
- Unidirectional data flow
- Reusable UI components
- Modular code structure
- Performance optimization (useMemo, useCallback)

### **User Experience**
- Intuitive UI/UX
- Fast page loading (Vite HMR)
- Responsive design
- Accessibility considerations
- Animation effects

**This document comprehensively covers all technical stacks and implementation details of the Festory project.**
