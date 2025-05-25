import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions
export interface VideoMetadata {
  id: string;
  title: string;
  duration: number;
  createdAt: string;
  status: 'processing' | 'completed' | 'error';
}

export interface TranscriptSegment {
  id: string;
  videoId: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface Question {
  id: string;
  segmentId: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

// Video APIs
export const uploadVideo = async (file: File): Promise<{ videoId: string }> => {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getVideoStatus = async (videoId: string): Promise<{ 
  status: 'processing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
}> => {
  const response = await api.get(`/videos/${videoId}/status`);
  return response.data;
};

export const getVideoMetadata = async (videoId: string): Promise<VideoMetadata> => {
  const response = await api.get(`/videos/${videoId}`);
  return response.data;
};

export const getVideoList = async (): Promise<VideoMetadata[]> => {
  const response = await api.get('/videos');
  return response.data;
};

// Transcript APIs
export const getTranscript = async (videoId: string): Promise<TranscriptSegment[]> => {
  const response = await api.get(`/videos/${videoId}/transcript`);
  return response.data;
};

// Question APIs
export const getQuestions = async (segmentId: string): Promise<Question[]> => {
  const response = await api.get(`/segments/${segmentId}/questions`);
  return response.data;
};

export const getVideoQuestions = async (videoId: string): Promise<{ 
  segmentId: string;
  questions: Question[];
}[]> => {
  const response = await api.get(`/videos/${videoId}/questions`);
  return response.data;
};

// Mock implementations for demo
export const mockUploadVideo = async (file: File): Promise<{ videoId: string }> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { videoId: 'mock-video-id-' + Math.random().toString(36).substring(2, 9) };
};

export const mockGetVideoStatus = async (videoId: string, step: number = 0): Promise<{ 
  status: 'processing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
}> => {
  const steps = [
    { id: 'upload', name: 'Uploading Video', status: 'completed', progress: 100 },
    { id: 'transcode', name: 'Transcoding Video', status: 'completed', progress: 100 },
    { id: 'transcribe', name: 'Transcribing Audio', status: 'processing', progress: 45 },
    { id: 'generate', name: 'Generating Questions', status: 'waiting', progress: 0 }
  ];
  
  // Simulate processing state based on step
  if (step === 0) {
    return { 
      status: 'processing', 
      currentStep: 'upload',
      progress: 30
    };
  } else if (step === 1) {
    return { 
      status: 'processing', 
      currentStep: 'transcode',
      progress: 70
    };
  } else if (step === 2) {
    return { 
      status: 'processing', 
      currentStep: 'transcribe',
      progress: 50
    };
  } else if (step === 3) {
    return { 
      status: 'processing', 
      currentStep: 'generate',
      progress: 30
    };
  } else {
    return { 
      status: 'completed', 
      currentStep: 'completed',
      progress: 100
    };
  }
};

export const mockGetTranscriptAndQuestions = async (videoId: string): Promise<{
  transcript: TranscriptSegment[];
  questions: { segmentId: string; questions: Question[] }[];
}> => {
  // Create mock transcript segments
  const transcript: TranscriptSegment[] = Array.from({ length: 12 }, (_, i) => ({
    id: `segment-${i}`,
    videoId,
    index: i,
    startTime: i * 300,
    endTime: (i + 1) * 300,
    text: `This is a sample transcript for segment ${i + 1}. In this part of the lecture, the speaker discusses important concepts related to the topic. They provide examples and explain key theories that students need to understand. The explanation continues with more details about the subject matter, ensuring a comprehensive coverage of the material presented in this section of the video.`
  }));
  
  // Create mock questions for each segment
  const questions = transcript.map(segment => ({
    segmentId: segment.id,
    questions: Array.from({ length: 3 }, (_, j) => ({
      id: `question-${segment.id}-${j}`,
      segmentId: segment.id,
      text: `What is the main concept discussed in segment ${segment.index + 1}, question ${j + 1}?`,
      options: [
        { id: `option-1-${segment.id}-${j}`, text: `The first potential answer to the question.`, isCorrect: j === 0 },
        { id: `option-2-${segment.id}-${j}`, text: `The second potential answer to the question.`, isCorrect: j === 1 },
        { id: `option-3-${segment.id}-${j}`, text: `The third potential answer to the question.`, isCorrect: j === 2 },
        { id: `option-4-${segment.id}-${j}`, text: `The fourth potential answer to the question.`, isCorrect: false }
      ]
    }))
  }));
  
  return { transcript, questions };
};

export default api;