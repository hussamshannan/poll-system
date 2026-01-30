# Poll System - Central Bank of Sudan Retirees Association

A full-stack bilingual (Arabic/English) polling system built with React and Node.js for the Central Bank of Sudan Retirees Association.

## Features

- **Bilingual Support**: Full Arabic and English interface with RTL/LTR layout switching
- **Voting System**: Secure voting with phone number and name validation
- **Duplicate Prevention**: Prevents duplicate votes by phone number and normalized Arabic names
- **Real-time Results**: Live vote statistics and visualizations with charts
- **Admin Panel**: Manage and view all votes with filtering and search capabilities
- **PDF Export**: Export poll results to PDF with custom filters
- **Rate Limiting**: Prevents spam and abuse with request rate limiting
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation
- **Express Rate Limit** - API rate limiting

## Project Structure

```
poll-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── VoteForm.jsx
│   │   │   ├── VoteChart.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Results.jsx
│   │   ├── contexts/       # React contexts
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── config/         # Configuration files
    │   │   └── database.js
    │   ├── middleware/     # Express middleware
    │   │   └── rateLimiter.js
    │   ├── models/         # Mongoose models
    │   │   └── Vote.js
    │   ├── routes/         # API routes
    │   │   └── votes.js
    │   ├── utils/          # Utility functions
    │   │   └── pdfGenerator.js
    │   └── server.js       # Entry point
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/yourusername/poll-system.git
cd poll-system
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## API Endpoints

### Votes
- `POST /api/vote` - Submit a new vote
- `GET /api/votes` - Get all votes (with filtering and pagination)
- `GET /api/stats` - Get voting statistics
- `GET /api/export/pdf` - Export results to PDF

### Query Parameters
- `answer` - Filter by vote answer (Yes/No)
- `search` - Search by name or phone
- `page` - Page number for pagination
- `limit` - Results per page
- `language` - Language preference (ar/en)

## Features in Detail

### Voting Form
- Name and phone number validation
- Duplicate vote prevention
- Real-time error messages in both languages
- Success notifications

### Admin Panel
- View all votes in a table format
- Filter by vote answer (Yes/No/All)
- Search by name or phone number
- Export filtered results to PDF
- Pagination for large datasets

### Results Visualization
- Total vote count
- Vote breakdown by answer
- Interactive charts
- Real-time updates

### Arabic Text Normalization
The system uses advanced Arabic text normalization to prevent duplicate names:
- Unicode normalization (NFC)
- Diacritic removal (tashkeel)
- Case-insensitive comparison
- Whitespace normalization

## Deployment

### Deploying to Vercel

#### Frontend (Client)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
6. Add environment variable:
   - `VITE_API_URL`: Your backend API URL
7. Deploy

#### Backend (Server)
1. Create a new project on Vercel
2. Configure:
   - **Root Directory**: server
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `FRONTEND_URL`: Your frontend URL
   - `NODE_ENV`: production
4. Create `vercel.json` in server directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```
5. Deploy

### Alternative Deployment Options
- **Backend**: Heroku, Railway, Render, AWS, DigitalOcean
- **Frontend**: Netlify, GitHub Pages, AWS S3
- **Database**: MongoDB Atlas (recommended)

## Environment Variables

### Server (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Client
If needed, create `.env` in client directory:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

## Security Features

- Rate limiting on vote submissions
- Phone number validation
- Input sanitization
- CORS configuration
- Duplicate vote prevention
- Secure MongoDB queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email hussamshannan5@gmail.com or create an issue in the repository.

## Acknowledgments

- Central Bank of Sudan Retirees Association
- Material-UI for the component library
- MongoDB for the database solution
