import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/video-player';
import TranscriptSegment, { Question } from '@/components/transcript-segment';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { mockGetTranscriptAndQuestions } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Segment {
  id: string;
  index: number;
  text: string;
  questions: Question[];
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [title, setTitle] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTitle(`Lecture ${id?.split('-').pop()}`);
        const { transcript, questions } = await mockGetTranscriptAndQuestions(id || '');
        const segmentsWithQuestions = transcript.map(segment => ({
          id: segment.id,
          index: segment.index,
          text: segment.text,
          questions: questions.find(q => q.segmentId === segment.id)?.questions || []
        }));
        setSegments(segmentsWithQuestions);
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlaySegment = (startTime: number) => {
    setCurrentTime(startTime);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleUpdateQuestions = (segmentIndex: number, updatedQuestions: Question[]) => {
    setSegments(prevSegments => 
      prevSegments.map(segment => 
        segment.index === segmentIndex 
          ? { ...segment, questions: updatedQuestions }
          : segment
      )
    );
    
    toast({
      title: "Questions updated",
      description: "The changes have been saved successfully.",
      variant: "success",
    });
  };

  const handleExport = () => {
    const data = {
      videoId: id,
      title,
      segments: segments.map(segment => ({
        index: segment.index,
        transcript: segment.text,
        questions: segment.questions
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-questions.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast({
      title: "Export successful",
      description: "Questions and transcript have been exported.",
      variant: "success",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer 
            src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" 
            onTimeUpdate={handleTimeUpdate}
          />
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <Tabs defaultValue="transcript">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="transcript" className="flex-1">Transcript</TabsTrigger>
                <TabsTrigger value="questions" className="flex-1">Questions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transcript">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading transcript...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {segments.map(segment => (
                        <TranscriptSegment
                          key={segment.id}
                          index={segment.index}
                          text={segment.text}
                          questions={[]}
                          onPlaySegment={handlePlaySegment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="questions">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading questions...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {segments.map(segment => (
                        <TranscriptSegment
                          key={segment.id}
                          index={segment.index}
                          text={segment.text}
                          questions={segment.questions}
                          onPlaySegment={handlePlaySegment}
                          onUpdateQuestions={handleUpdateQuestions}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Video Summary</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p>1 hour 4 minutes</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Segments</h3>
                <p>{segments.length} segments (5 minutes each)</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Questions Generated</h3>
                <p>{segments.reduce((acc, segment) => acc + segment.questions.length, 0)} questions</p>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['Machine Learning', 'Neural Networks', 'Data Science', 'Algorithms', 'AI Ethics'].map(topic => (
                    <span 
                      key={topic} 
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;