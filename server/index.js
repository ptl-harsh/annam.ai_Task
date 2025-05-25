import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'video/mp4') {
      return cb(new Error('Only MP4 videos are allowed'));
    }
    cb(null, true);
  }
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    // In a real application, we would:
    // 1. Save metadata to database
    // 2. Start background processing
    
    // For demo, just return a success with the filename as ID
    const videoId = path.basename(req.file.filename, path.extname(req.file.filename));
    
    res.status(200).json({
      message: 'Video uploaded successfully',
      videoId: videoId,
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

app.get('/api/videos/:id/status', (req, res) => {
  // In a real app, we would check the processing status in the database
  const videoId = req.params.id;
  
  // Mock response for demo
  res.json({
    videoId,
    status: 'processing',
    currentStep: 'transcribe',
    progress: 45
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Mock data for development
const mockData = {
  videos: [
    {
      id: 'video1',
      title: 'Introduction to Machine Learning',
      duration: 3720, // 1h 2m
      createdAt: '2025-05-01T12:00:00Z',
      status: 'completed'
    },
    {
      id: 'video2',
      title: 'Neural Networks Explained',
      duration: 4500, // 1h 15m
      createdAt: '2025-04-28T15:30:00Z',
      status: 'completed'
    }
  ]
};

// Additional mock endpoints
app.get('/api/videos', (req, res) => {
  res.json(mockData.videos);
});

app.get('/api/videos/:id', (req, res) => {
  const video = mockData.videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  
  res.json(video);
});