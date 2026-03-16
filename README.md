# 🌟 Gema Sehati - Family Health & Literacy App

**Gema Sehati** is a family-focused web app for tracking child growth, health, literacy habits, and family moments in one place.

![React](https://img.shields.io/badge/React-19.2.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-8.0.0-purple)
![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan)

## ⚡ Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. Run SQL migrations in `supabase/migrations/` (in order) in the Supabase SQL Editor.
4. Create a public storage bucket named `activity-photos` in Supabase Storage.
5. Start the app:
   ```bash
   npm run dev
   ```

App URL: `http://localhost:5173`

## ✨ Features

### 📊 Dashboard
- Quick overview of family activities
- Recent reading logs
- Upcoming immunization reminders
- Child profile management
- Add and manage multiple children

### 📚 Literacy & Stories
- **Reading Log Tracker**: Record daily reading activities with duration and notes
- **Story Library**: Curated collection of educational children's stories (dongeng)
- Age-appropriate story categorization (0-3, 4-6, 7-12 years)
- Interactive story reading interface
- Track reading progress and habits

### 🏥 Health & Growth Monitoring
- **Growth Records**: Track height, weight, and BMI status
- **Immunization Tracker**: Schedule and monitor vaccinations
- **MPASI Recipes**: Comprehensive library of baby food recipes with nutrition information
- **Educational Videos**: Embedded health and nutrition video content
- Automatic growth status calculation (Normal/Kurang/Berlebih)
- Visual data presentation with color-coded indicators

### 📸 Family Gallery
- Upload and organize family activity photos
- Add captions and dates to memories
- Filter photos by child
- Safe cloud storage with Supabase

### 👤 Profile Management
- **User Profile**: Update full name and personal information
- **Password Management**: Change password securely
- Profile synchronization across authentication and database

### 🛡️ Admin Dashboard
- **Overview Tab**: Real-time statistics (total users, children, reading logs, immunization rates)
- **User Management**: View all users, search functionality, activate/suspend user accounts
- **Children Management**: View all children across the platform with search and filtering
- **Content Management**:
   - Create, edit, and delete stories in the story library
   - Manage MPASI recipes (add, update, remove)
   - Manage educational videos (add, update, remove)
- **Analytics Dashboard**:
  - Growth statistics (average height/weight across all children)
  - Immunization coverage with visual progress indicators
  - Monthly reading trends (last 6 months)
  - CSV data export for all major data types (children, growth records, reading logs, immunization data)
- **Admin-only Access**: Restricted to users with admin privileges

### 🔐 Authentication & Security
- Secure user authentication via Supabase Auth
- Row-Level Security (RLS) policies
- Each family has private, isolated data
- Email-based authentication
- User profile system with account status management
- Admin role-based access control

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage for photos
  - Real-time subscriptions
  - Row-Level Security (RLS)

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Supabase Account** - [Sign up for free](https://supabase.com)

## 🚀 Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gema-sehati
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase**
   
   - Create a new project in [Supabase Dashboard](https://app.supabase.com)
   - Copy your project URL and anon key to the `.env` file
   - Run the migrations to create the database schema

5. **Run database migrations**
   
   Execute the SQL files in `supabase/migrations/` in your Supabase SQL Editor (in order):
   - `20260224053301_create_family_app_schema.sql` - Core schema (children, reading, health, gallery)
   - `20260228040030_add_mpasi_recipes.sql` - MPASI recipe system
   - `20260303090000_add_admin_dashboard_access.sql` - Admin system with user profiles
   - `20260304103000_allow_user_update_own_profile.sql` - User profile self-service
   - `20260306110000_add_activity_photo_public_storage.sql` - Public storage bucket for photos
   - `20260308000000_add_videos_table.sql` - Educational videos content management

6. **Enable Storage Bucket** (for photo uploads)
   
   In your Supabase Dashboard:
   - Go to Storage
   - Create a new bucket named `activity-photos`
   - Set the bucket to public (RLS policies are already configured)

7. **Set up Admin User** (optional)
   
   To grant admin access to a user:
   - Go to Supabase Dashboard → Authentication → Users
   - Find the user and click to edit
   - In the "User Metadata" section, add:
     ```json
     {
       "is_admin": true
     }
     ```
   - Save changes
   - The user will have access to the Admin panel on next login

## 💻 Development

Start the development server:

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

### Other Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Seed stories + MPASI recipes
npm run seed:content

# Seed with reset (wipe current stories + recipes first)
npm run seed:content:reset
```

> Note: the seeder uses `.env` and requires `SUPABASE_SERVICE_ROLE_KEY`.
> ```env
> VITE_SUPABASE_URL=your_supabase_project_url
> SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
> ```

## 📁 Project Structure

```
gema-sehati/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.tsx        # Authentication UI
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Health.tsx      # Health tracking
│   │   ├── Literacy.tsx    # Reading logs & stories
│   │   ├── Gallery.tsx     # Photo gallery
│   │   ├── Profile.tsx     # User profile & password management
│   │   ├── Layout.tsx      # App layout wrapper
│   │   ├── MPASI.tsx       # Baby food recipes
│   │   └── Admin/          # Admin dashboard components
│   │       ├── index.tsx          # Main admin component
│   │       ├── OverviewTab.tsx    # Statistics overview
│   │       ├── UsersTab.tsx       # User management
│   │       ├── ChildrenTab.tsx    # Children management
│   │       ├── StoriesTab.tsx     # Story content management
│   │       ├── MPASITab.tsx       # Recipe management
│   │       ├── VideosTab.tsx      # Video content management
│   │       ├── AnalyticsTab.tsx   # Analytics & CSV export
│   │       ├── types.ts           # TypeScript definitions
│   │       └── utils.ts           # Helper functions
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── lib/                # Utilities
│   │   ├── supabase.ts     # Supabase client & types
│   │   ├── storage.ts      # Storage utilities
│   │   └── imageTransform.ts # Image transformation helpers
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── scripts/
│   └── seed-content.mjs    # Content seeding script
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 📊 Database Schema

The application uses the following main tables:

- **user_profiles** - User profile information (full_name, email, is_active status)
- **children** - Child profiles with name, birth date, and gender
- **reading_logs** - Daily reading activity tracking
- **growth_records** - Height and weight measurements with BMI status
- **immunization_records** - Vaccination schedule and completion tracking
- **stories** - Collection of children's stories (admin-managed)
- **activity_photos** - Family activity photo gallery with cloud storage paths
- **mpasi_recipes** - Baby food recipes with ingredients, instructions, and nutrition info (admin-managed)
- **videos** - Educational health and nutrition video links and metadata (admin-managed)

**Storage Buckets:**
- **activity-photos** - Public bucket for family photos with user-scoped RLS policies

All tables implement Row-Level Security (RLS) to ensure data privacy. Admin access is controlled via JWT metadata (`is_admin` flag).

## 🎯 Typical User Flow

1. **Sign Up/Login**
   - Create an account using your email
   - Verify your email address

2. **Add Children**
   - Navigate to Dashboard
   - Click "Tambah Anak" to add child profiles
   - Fill in name, birth date, and gender

3. **Track Reading Activities**
   - Go to "Literasi" section
   - Log reading sessions with book title, duration, and notes
   - Browse curated stories in the Story Library

4. **Monitor Health**
   - Visit "Kesehatan" section
   - Record growth measurements (height & weight)
   - Schedule and track immunizations
   - Browse MPASI recipes for baby food ideas
   - Watch educational health videos

5. **Capture Memories**
   - Open "Galeri" section
   - Upload family photos with captions
   - Organize by date and child

6. **Manage Profile**
   - Navigate to "Profil" section
   - Update your full name and personal information
   - Change your password securely

7. **Admin Functions** (Admin users only)
   - Access "Admin" panel from navigation
   - View platform-wide statistics and analytics
   - Manage user accounts (activate/suspend)
   - Create and manage story library content
   - Add and edit MPASI recipes
   - Add and edit educational videos
   - Export data to CSV for analysis

<!-- ## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. -->

## 🙏 Acknowledgments

- Icons by [Lucide Icons](https://lucide.dev/)
- Backend powered by [Supabase](https://supabase.com)
- UI styled with [Tailwind CSS](https://tailwindcss.com)

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Made with ❤️ for families who care about healthy growth and learning
