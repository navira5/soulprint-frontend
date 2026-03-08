# Soulprint Frontend

A React-based web interface for Soulprint personality analysis platform. Upload transcripts, analyze personalities, and interact with AI-powered persona replications.

## Features

- **Transcript Upload**: Support for text files containing conversation transcripts
- **Dual Analysis Modes**:
  - **Human Mode**: Fast, synchronous analysis focused on speaker-specific personality extraction
  - **Vigil Mode**: Advanced asynchronous analysis with core, cognition, and symbolic processing
- **Real-time Progress Tracking**: Visual progress bar with status messages during analysis
- **Persona Management**: Browse and manage analyzed personas
- **Interactive Chat**: Engage in conversations with AI-powered persona replications
- **File Downloads**: Download analysis results in multiple formats (JSON, CSV, TXT)
- **Responsive Design**: Modern, clean interface with Tailwind CSS

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js 16+ and npm
- Backend API server running (see soulprint-analyzer repository)

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/navira5/soulprint-frontend.git
cd soulprint-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file:
\`\`\`bash
cp .env.template .env
\`\`\`

4. Configure your environment variables in \`.env\`:
\`\`\`
VITE_API_BASE_URL=http://localhost:5001
\`\`\`

## Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at \`http://localhost:5173\`

## Build

Create a production build:
\`\`\`bash
npm run build
\`\`\`

Preview the production build:
\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
soulprint-frontend/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable React components
│   ├── pages/         # Page components
│   ├── store/         # Zustand state management
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
└── index.html         # HTML template
\`\`\`

## Usage

### Uploading Transcripts

1. Navigate to the upload page
2. Select **Human Mode** for speaker-specific analysis or **Vigil Mode** for advanced analysis
3. Upload a transcript file (ensure speakers are labeled as "Speaker Name:")
4. Enter the persona name (Human Mode) or select analysis modes (Vigil Mode)
5. Monitor the progress bar during analysis

### Viewing Results

- Browse personas in the Personas page
- Click on a persona to view detailed analysis results
- Download analysis files (JSON, CSV, TXT)
- Start chatting with the AI persona replication

## API Integration

The frontend communicates with the backend via REST API:

- \`GET /api/personas\` - List all personas
- \`GET /api/persona/soulseed/latest\` - Get persona details
- \`POST /api/analyze/transcript\` - Analyze transcript (Human Mode)
- \`POST /api/vigil/start\` - Start Vigil analysis
- \`GET /api/vigil/status/:job_id\` - Poll Vigil job status
- \`GET /api/download/file\` - Download analysis files
- \`POST /api/persona/chat/init\` - Initialize chat session
- \`POST /api/persona/chat\` - Send chat message

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Navira Abbasi
