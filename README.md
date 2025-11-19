# CAPS Tutor

**CAPS Tutor** is an AI-powered educational platform designed to provide personalized tutoring aligned with the South African Curriculum and Assessment Policy Statement (CAPS) for Grades 10-12. The platform offers comprehensive learning resources, interactive practice questions, AI-powered tutoring, and Grade 12 CAPS past papers with authentic exam layouts.

## 🌟 Features

### For Students

- **AI-Powered Tutoring**: Interactive AI tutor that provides step-by-step explanations and personalized help 24/7
- **Adaptive Practice Questions**: Personalized practice questions tailored to your grade, subject, and weak areas
- **CAPS-Aligned Content**: All content meticulously mapped to the official CAPS curriculum for Grades 10-12
- **Grade 12 Past Papers**: Access to authentic CAPS past papers (Paper 1, Paper 2, Memos) with proper exam structure
- **Progress Tracking**: Comprehensive analytics tracking lessons completed, mastery per topic, time spent, and historical performance
- **Interactive Lessons**: Searchable lesson hub with embedded practice questions and quizzes
- **Achievement System**: Unlock achievements as you progress through your learning journey
- **Multi-language Support**: Support for all 11 official South African languages

### For Administrators

- **Admin Dashboard**: Comprehensive monitoring and management tools
- **Past Paper Management**: Upload and manage Grade 12 CAPS past papers (PDF or JSON formats)
- **Content Control**: Manage practice questions, subject availability, and weekly tasks
- **Student Management**: View class progress, identify problematic topics, and export reports
- **Analytics & Reports**: Detailed insights into student engagement, performance, and mastery
- **System Settings**: Configure announcements, features, and system-wide settings

## 📚 Subjects Supported

The platform covers all major CAPS subjects for Grades 10-12:

- **Mathematics**
- **Physical Sciences**
- **Life Sciences**
- **Accounting**
- **Business Studies**
- **Economics**
- **Geography**
- **History**
- **Information Technology**
- **Computer Applications Technology (CAT)**
- **English** (Home Language & First Additional Language)
- **Afrikaans** (Huistaal & Eerste Addisionele Taal)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) with TypeScript
- **React 18** with React Hooks
- **Tailwind CSS** for styling
- **shadcn/ui** components (Radix UI primitives)
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Appwrite** for database, authentication, and file storage
- **Next.js API Routes** for server-side logic
- **Groq API** for AI-powered question generation and tutoring

### PDF Processing
- **PyMuPDF (fitz)** for PDF extraction
- **OpenCV** for image processing and diagram detection
- **Python** scripts for PDF processing pipeline

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Node.js** runtime

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Appwrite account and project (for backend services)
- Groq API key (for AI features)
- (Optional) NewsAPI.org key (for educational news)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nibsi3/CAPS-Tutor.git
   cd CAPS-Tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Appwrite Configuration (Required)
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=capstutor
   APPWRITE_API_KEY=your_api_key

   # Groq API (Required for AI features)
   GROQ_API_KEY=your_groq_api_key

   # News API (Optional)
   NEWS_API_KEY=your_news_api_key
   ```

4. **Set up Appwrite Collections**
   
   Follow the setup guide in `docs/APPWRITE_COLLECTIONS_SETUP.md` to create the required collections:
   - `user` - User profiles
   - `userprogress` - Student progress tracking
   - `questions` - Practice questions
   - `pastpapers` - Past paper metadata
   - `admins` - Administrator accounts
   - `announcements` - System announcements
   - `systemsettings` - System configuration
   - And more...

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:9002`

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
CAPS-Tutor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Student dashboard pages
│   │   └── ...
│   ├── components/             # React components
│   │   ├── admin/              # Admin components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── home/               # Home page components
│   │   └── ui/                 # shadcn/ui components
│   ├── appwrite/               # Appwrite client configuration
│   ├── ai/                     # AI/Groq integration
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility libraries
├── scripts/                    # Utility scripts
│   ├── add-admin.mjs          # Add admin user
│   ├── add-presets-to-appwrite.mjs
│   └── ...
├── docs/                       # Documentation
│   ├── APPWRITE_COLLECTIONS_SETUP.md
│   ├── TECH_STACK_OVERVIEW.md
│   └── ...
└── public/                     # Static assets
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Appwrite Collections Setup](docs/APPWRITE_COLLECTIONS_SETUP.md)** - Complete guide to setting up Appwrite collections
- **[Tech Stack Overview](docs/TECH_STACK_OVERVIEW.md)** - Detailed technical documentation
- **[Question Generation Guide](docs/QUESTION_GENERATION_GUIDE.md)** - How questions are generated
- **[Past Paper Processing](docs/NEW_PDF_PROCESSING_PIPELINE.md)** - PDF processing pipeline
- **[Migration Guide](docs/MIGRATION_GUIDE.md)** - Migration instructions

## 🔧 Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run generate-questions` - Generate practice questions
- `npm run add-presets` - Add question presets to Appwrite

## 🌐 Multi-language Support

CAPS Tutor supports all 11 official South African languages:
- English
- Afrikaans
- isiNdebele
- isiXhosa
- isiZulu
- Sepedi
- Sesotho
- Setswana
- siSwati
- Tshivenḓa
- Xitsonga

## 🎯 Key Features Explained

### AI Tutoring
The AI tutor understands the CAPS curriculum and provides personalized help. Students can ask questions about any topic and receive step-by-step explanations tailored to their grade level.

### Past Paper Practice
Grade 12 students can practice with authentic CAPS past papers. The system maintains the exact structure, sections, and question types from official exam papers, including:
- Multiple choice questions
- Standard structured questions
- Long-form responses
- Diagrams and graphs
- Data-response questions

### Progress Tracking
Students can track their progress across all subjects with detailed analytics showing:
- Lessons completed
- Average scores
- Time spent studying
- Weak areas identified
- Historical performance trends

### Admin Dashboard
Administrators have access to comprehensive management tools for:
- Monitoring student engagement
- Managing past papers and content
- Generating reports
- Configuring system settings
- Managing users and permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 📞 Support

For support or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for South African students**
