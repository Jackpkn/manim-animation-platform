# PromptViz - AI-Powered Manim Animation Platform

PromptViz is a modern web application that allows users to create mathematical animations using Manim through natural language prompts. Powered by Gemini AI, it translates your ideas into beautiful mathematical visualizations.

![PromptViz Demo](public/demo.gif)

## 🌟 Features

- **AI-Powered Animation Generation**: Describe your animation in natural language, and our AI will generate the corresponding Manim code
- **Real-time Preview**: See your animations come to life instantly
- **Interactive Code Editor**: Edit and customize your animations with a powerful Monaco-based code editor
- **Project Management**: Save and organize your animations
- **Secure Authentication**: Built-in user authentication using Clerk
- **Responsive Design**: Beautiful UI that works on all devices
- **Database Integration**: Persistent storage using Neon Database with Drizzle ORM

## 🚀 Tech Stack

- **Frontend**:
  - Next.js 15 with App Router
  - React 19
  - TailwindCSS
  - Framer Motion for animations
  - Monaco Editor for code editing
  - tParticles for background effects

- **Backend**:
  - Next.js API Routes
  - Manim for animation generation
  - Gemini AI for code generation
  - FFmpeg for video processing

- **Database**:
  - Neon Database (PostgreSQL)
  - Drizzle ORM for type-safe database operations

- **Authentication**:
  - Clerk for secure user authentication

## 📋 Prerequisites

- Node.js 18+ or later
- pnpm package manager
- Python 3.8+ with Manim installed
- FFmpeg installed on your system
- Neon Database account
- Clerk account for authentication
- Gemini API key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Jackpkn/manim-animation-platform
cd promptviz
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="your_neon_database_url"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
GEMINI_API_KEY="your_gemini_api_key"
```

4. Run database migrations:
```bash
pnpm db:generate
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── db/                  # Database schema and migrations
└── styles/             # Global styles
```

## 🔧 Database Schema

The application uses the following database tables:

- **Users**: Stores user information
- **Projects**: Stores animation projects
- **Chats**: Stores conversation history with AI
- **GeneratedCode**: Stores different versions of generated code

## 🎨 Usage

1. **Create an Animation**:
   - Sign in to your account
   - Enter a description of your desired animation
   - The AI will generate Manim code
   - Preview and customize the animation

2. **Edit Code**:
   - Use the built-in code editor to modify the generated code
   - Real-time preview of changes
   - Save your modifications

3. **Manage Projects**:
   - Save your animations
   - Organize them into projects
   - Share with others (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Manim](https://github.com/ManimCommunity/manim) for the animation engine
- [Gemini AI](https://deepmind.google/technologies/gemini/) for code generation
- [Clerk](https://clerk.dev/) for authentication
- [Neon](https://neon.tech/) for database hosting

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using Next.js and Manim
