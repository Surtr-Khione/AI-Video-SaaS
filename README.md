# AI Video SaaS

A modern web-based AI Video SaaS platform with a beautiful, responsive front-end interface.

## Features

- 🎬 Modern, responsive web interface
- 🤖 AI-powered video processing capabilities
- ✂️ Smart video editing features
- 🎙️ Audio processing and enhancement
- 📝 Automatic transcription
- 🎨 Style transfer and filters
- ⚡ Fast cloud-based processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI-Video-SaaS
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
AI-Video-SaaS/
├── public/              # Static files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Stylesheet
│   └── app.js          # Client-side JavaScript
├── server.js           # Express server
├── package.json        # Project dependencies
└── README.md          # This file
```

## Usage

1. Access the web interface through your browser
2. Navigate through the different sections:
   - **Features**: View available AI capabilities
   - **Upload**: Upload and process videos
   - **Pricing**: View subscription plans
   - **About**: Learn more about the platform

3. To upload a video:
   - Click on the "Upload" section
   - Drag and drop a video file or click to browse
   - Click "Process Video" to start processing

## Development

To run in development mode:

```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## API Endpoints

- `GET /` - Serves the main web interface
- `GET /health` - Health check endpoint

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Styling**: Custom CSS with modern design patterns

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT