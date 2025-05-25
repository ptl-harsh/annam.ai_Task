import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = parseFloat(e.target.value);
    video.volume = volumeValue;
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gray-900 shadow-lg">
      <div className="relative">
        <video 
          ref={videoRef} 
          src={src} 
          className="w-full h-auto" 
          onClick={togglePlay}
        />
      </div>
      
      <div className="bg-gray-800 p-3 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <button 
            onClick={togglePlay}
            className="text-white p-1 rounded-full hover:bg-gray-700"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          
          <div className="text-xs text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <button 
              onClick={toggleMute}
              className="text-white p-1 rounded-full hover:bg-gray-700"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>
        
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-blue-500 h-1"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;