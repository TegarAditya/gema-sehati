# 🌟 Gema Sehati - Family Health & Literacy App

**Gema Sehati** is a comprehensive family-focused web application designed to help parents track and manage their children's health, growth, literacy activities, and precious family moments. Built with modern web technologies, it provides an intuitive interface for monitoring child development and promoting healthy family habits.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)
![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan)

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

### 🔐 Authentication & Security
- Secure user authentication via Supabase Auth
- Row-Level Security (RLS) policies
- Each family has private, isolated data
- Email-based authentication

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

## 🚀 Installation

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
   ```

4. **Set up Supabase**
   
   - Create a new project in [Supabase Dashboard](https://app.supabase.com)
   - Copy your project URL and anon key to the `.env` file
   - Run the migrations to create the database schema

5. **Run database migrations**
   
   Execute the SQL files in `supabase/migrations/` in your Supabase SQL Editor:
   - `20260224053301_create_family_app_schema.sql`
   - `20260228040030_add_mpasi_recipes.sql`

6. **Enable Storage Bucket** (for photo uploads)
   
   In your Supabase Dashboard:
   - Go to Storage
   - Create a new bucket named `activity-photos`
   - Set the bucket to public or configure appropriate RLS policies

## 💻 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

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

> Note: the seeder reads `.env` file and requires `SUPABASE_SERVICE_ROLE_KEY` to be set. Add it to your `.env`:
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
│   │   ├── Layout.tsx      # App layout wrapper
│   │   └── MPASI.tsx       # Baby food recipes
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── lib/                # Utilities
│   │   └── supabase.ts     # Supabase client & types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 📊 Database Schema

The application uses the following main tables:

- **children** - Child profiles with name, birth date, and gender
- **reading_logs** - Daily reading activity tracking
- **growth_records** - Height and weight measurements
- **immunization_records** - Vaccination schedule and completion
- **stories** - Collection of children's stories
- **activity_photos** - Family activity photo gallery
- **mpasi_recipes** - Baby food recipes with ingredients and instructions

All tables implement Row-Level Security (RLS) to ensure data privacy.

## 🎯 Usage

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
