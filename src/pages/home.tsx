import React, { useState } from 'react';
import VideoUpload from '@/components/video-upload';
import ProcessingStatus, { ProcessingStep } from '@/components/processing-status';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { mockUploadVideo, mockGetVideoStatus, mockGetTranscriptAndQuestions } from '@/services/api';
import { FileVideo, Plus } from 'lucide-react';

const Home: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'upload', name: 'Uploading Video', status: 'waiting', progress: 0 },
    { id: 'transcode', name: 'Transcoding Video', status: 'waiting', progress: 0 },
    { id: 'transcribe', name: 'Transcribing Audio', status: 'waiting', progress: 0 },
    { id: 'generate', name: 'Generating Questions', status: 'waiting', progress: 0 }
  ]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [videosList, setVideosList] = useState<{id: string, title: string, date: string}[]>([
    { id: 'sample-1', title: 'Introduction to Machine Learning', date: '2025-01-15' },
    { id: 'sample-2', title: 'Data Structures and Algorithms', date: '2025-01-10' }
  ]);

  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Update upload step
      updateProcessingStep('upload', 'processing', 10);
      
      // Mock API call
      const response = await mockUploadVideo(file);
      setVideoId(response.videoId);
      
      // Mark upload as complete
      updateProcessingStep('upload', 'completed', 100);
      
      // Start processing
      setIsProcessing(true);
      simulateVideoProcessing();
      
      toast({
        title: "Upload successful",
        description: "Your video is now being processed.",
        variant: "success",
      });
    } catch (error) {
      console.error('Upload error:', error);
      updateProcessingStep('upload', 'error', 0);
      
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateProcessingStep = (stepId: string, status: 'waiting' | 'processing' | 'completed' | 'error', progress: number) => {
    setProcessingSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, status, progress } 
          : step
      )
    );
    
    if (status === 'processing') {
      setCurrentStep(stepId);
    }
  };

  const simulateVideoProcessing = async () => {
    // Simulate transcoding
    updateProcessingStep('transcode', 'processing', 0);
    await simulateProgress('transcode', 10, 100, 50);
    updateProcessingStep('transcode', 'completed', 100);
    
    // Simulate transcription
    updateProcessingStep('transcribe', 'processing', 0);
    await simulateProgress('transcribe', 5, 100, 150);
    updateProcessingStep('transcribe', 'completed', 100);
    
    // Simulate question generation
    updateProcessingStep('generate', 'processing', 0);
    await simulateProgress('generate', 10, 100, 100);
    updateProcessingStep('generate', 'completed', 100);
    
    // Complete processing
    setIsProcessing(false);
    setCurrentStep('completed');
    
    // Add to videos list
    setVideosList(prevList => [
      { 
        id: videoId || 'unknown', 
        title: `Lecture ${prevList.length + 1}`, 
        date: new Date().toISOString().split('T')[0]
      },
      ...prevList
    ]);
    
    toast({
      title: "Processing complete",
      description: "Your video has been processed successfully.",
      variant: "success",
    });
  };

  const simulateProgress = async (stepId: string, increment: number, max: number, delay: number) => {
    return new Promise<void>(resolve => {
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += increment;
        
        updateProcessingStep(stepId, 'processing', Math.min(progress, max));
        
        if (progress >= max) {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  };

  const resetProcess = () => {
    setIsProcessing(false);
    setVideoId(null);
    setCurrentStep('');
    setProcessingSteps([
      { id: 'upload', name: 'Uploading Video', status: 'waiting', progress: 0 },
      { id: 'transcode', name: 'Transcoding Video', status: 'waiting', progress: 0 },
      { id: 'transcribe', name: 'Transcribing Audio', status: 'waiting', progress: 0 },
      { id: 'generate', name: 'Generating Questions', status: 'waiting', progress: 0 }
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="upload" className="flex-1">Upload Video</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">My Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Upload Video Lecture</h2>
            
            {isProcessing || currentStep === 'completed' ? (
              <div className="space-y-6">
                <ProcessingStatus 
                  steps={processingSteps} 
                  currentStep={currentStep} 
                />
                
                {currentStep === 'completed' && (
                  <div className="flex justify-end">
                    <Button onClick={resetProcess}>
                      Upload Another Video
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <VideoUpload 
                onUpload={handleUpload} 
                isUploading={isUploading} 
              />
            )}
          </div>
          
          {currentStep === 'completed' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Processing Complete</h2>
              <p className="mb-4">Your video has been successfully processed. You can now view the generated transcript and questions.</p>
              <div className="flex justify-end">
                <Button>
                  View Results
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Videos</h2>
              <Button size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Upload New
              </Button>
            </div>
            
            {videosList.length > 0 ? (
              <div className="space-y-4">
                {videosList.map(video => (
                  <div 
                    key={video.id}
                    className="border rounded-lg p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                        <FileVideo className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-500">Uploaded on {video.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full inline-block mb-4">
                  <FileVideo className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-gray-500 mb-4">Upload your first video to get started</p>
                <Button>Upload Video</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;