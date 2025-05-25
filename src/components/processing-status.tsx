import React from 'react';
import { Progress } from './ui/progress';
import { Loader2 } from 'lucide-react';

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  currentStep: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-medium">Processing Video</h3>
      
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const isWaiting = step.status === 'waiting';
          
          return (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isActive && !isCompleted && !isError && (
                    <Loader2 className="h-4 w-4 mr-2 text-blue-600 animate-spin" />
                  )}
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    isError ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {isCompleted 
                    ? 'Complete' 
                    : isError 
                    ? 'Error' 
                    : isWaiting 
                    ? 'Waiting' 
                    : `${step.progress}%`
                  }
                </span>
              </div>
              
              <Progress 
                value={isCompleted ? 100 : step.progress} 
                className={`h-2 ${
                  isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 
                  isError ? 'bg-red-100 dark:bg-red-900/20' : 
                  'bg-gray-100 dark:bg-gray-800'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatus;