# WooRank-Inspired SEO Analyzer

A full-stack web application that analyzes websites for SEO best practices. This project consists of a RESTful API backend and a React frontend that provides automated SEO analysis by fetching web pages, parsing HTML content, and evaluating key SEO factors.

## Project Overview

This SEO Analyzer evaluates websites based on fundamental SEO criteria including meta tags, heading structure, image accessibility, and security protocols. The service returns a numerical score (0-100) along with detailed feedback on passed checks and identified issues. The frontend provides an intuitive interface for submitting URLs and viewing analysis results.

## Features

- **HTML Content Fetching**: Retrieves web page content with timeout and error handling
- **SEO Data Extraction**: Parses title tags, meta descriptions, heading structure, images, and links
- **Scoring System**: Calculates SEO score based on five key criteria (20 points each)
- **Error Handling**: Comprehensive error handling for invalid URLs, timeouts, blocked sites, and edge cases
- **RESTful API**: Clean JSON responses with appropriate HTTP status codes
- **React Frontend**: Modern, responsive user interface for SEO analysis
- **Real-time Analysis**: Submit URLs and view results instantly

## Tech Stack

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Axios**: HTTP client for fetching web content
- **Cheerio**: Server-side HTML parsing and manipulation
- **CORS**: Cross-origin resource sharing support

### Frontend

- **React**: UI library
- **Vite**: Build tool and development server
- **JavaScript**: Programming language

## Installation

### Backend Setup

```bash
# Install backend dependencies
npm install

# Start the backend server
npm start
```

The server will start on port 3000 by default, or the port specified in the `PORT` environment variable.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on port 5173 by default (Vite's default port).

### Running Both Services

1. Start the backend server (from project root):

   ```bash
   npm start
   ```

2. Start the frontend development server (from `frontend` directory):

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to use the application.

## Scoring Criteria

The SEO score is calculated based on five criteria, each worth 20 points:

1. **Title Tag Present** (20 points)
2. **Meta Description Present** (20 points)
3. **At Least One H1 Tag** (20 points)
4. **All Images Have Alt Text** (20 points)
5. **HTTPS Usage** (20 points)

Maximum score: 100 points

## Error Handling

The API handles various error scenarios with appropriate HTTP status codes:

- **400 Bad Request**: Invalid URL format, missing required fields
- **403 Access Forbidden**: Blocked websites, connection refused
- **408 Request Timeout**: Request timeout during fetch
- **413 Payload Too Large**: Page content exceeds 10MB limit
- **422 Unprocessable Content**: Empty HTML response
- **500 Internal Server Error**: Unexpected server errors
- **502 Bad Gateway**: DNS failures, target server errors

## Project Structure

```
seo-analyzer/
├── src/                          # Backend source code
│   ├── routes/
│   │   └── analyze.js           # API route handler
│   ├── services/
│   │   └── seoService.js       # Business logic (fetch, parse, score)
│   ├── utils/
│   │   └── errorHandler.js     # Error handling utility
│   └── server.js                # Express server setup
├── frontend/                     # Frontend React application
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── vite.config.js
├── package.json                  # Backend dependencies
└── README.md
```

## Disclaimer

This project is inspired by WooRank's SEO analysis functionality but is not affiliated with, endorsed by, or connected to WooRank. This is an independent educational project built for learning and demonstration purposes.

## License

ISC
