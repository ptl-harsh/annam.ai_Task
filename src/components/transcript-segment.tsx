import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { getSegmentTimestamp } from '@/lib/utils';
import { Button } from './ui/button';

export interface TranscriptSegmentProps {
  index: number;
  text: string;
  questions: Question[];
  onPlaySegment?: (startTime: number) => void;
  onUpdateQuestions?: (index: number, questions: Question[]) => void;
}

export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  index,
  text,
  questions,
  onPlaySegment,
  onUpdateQuestions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  const segmentStartTime = index * 300; // 5 minutes = 300 seconds
  const timestamp = getSegmentTimestamp(index);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePlaySegment = () => {
    if (onPlaySegment) {
      onPlaySegment(segmentStartTime);
    }
  };

  const toggleShowAnswer = (questionId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const startEditing = (question: Question) => {
    setEditingQuestion(question.id);
    setEditedQuestion({ ...question });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditedQuestion(null);
  };

  const saveQuestion = () => {
    if (editedQuestion && onUpdateQuestions) {
      const updatedQuestions = questions.map(q => 
        q.id === editedQuestion.id ? editedQuestion : q
      );
      onUpdateQuestions(index, updatedQuestions);
      setEditingQuestion(null);
      setEditedQuestion(null);
    }
  };

  const updateOption = (optionId: string, newText: string, isCorrect: boolean) => {
    if (editedQuestion) {
      const updatedOptions = editedQuestion.options.map(opt =>
        opt.id === optionId ? { ...opt, text: newText, isCorrect } : { ...opt, isCorrect: isCorrect ? false : opt.isCorrect }
      );
      setEditedQuestion({ ...editedQuestion, options: updatedOptions });
    }
  };

  return (
    <div className="border rounded-lg shadow-sm mb-4 bg-white dark:bg-gray-800 transition-all duration-200">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-blue-600 mr-2" />
          <span className="font-medium">{timestamp}</span>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handlePlaySegment();
            }}
            className="mr-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            Play segment
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
            <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">Transcript</h4>
            <p className="text-sm leading-relaxed">{text}</p>
          </div>

          {questions.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-500 mb-3">Questions</h4>
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    {editingQuestion === question.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editedQuestion?.text || ''}
                          onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, text: e.target.value } : null)}
                          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                        <div className="space-y-2">
                          {editedQuestion?.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={option.isCorrect}
                                onChange={() => updateOption(option.id, option.text, true)}
                                className="text-blue-600"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateOption(option.id, e.target.value, option.isCorrect)}
                                className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={cancelEditing}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveQuestion}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm flex-1">{question.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(question)}
                            className="ml-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 mb-2">
                          {question.options.map((option) => (
                            <div 
                              key={option.id} 
                              className={`text-sm p-2 rounded flex items-center ${
                                showAnswers[question.id] && option.isCorrect
                                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {showAnswers[question.id] && option.isCorrect && (
                                <span className="text-green-600 mr-1">✓</span>
                              )}
                              {option.text}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowAnswer(question.id)}
                            className="text-xs"
                          >
                            {showAnswers[question.id] ? 'Hide Answer' : 'Show Answer'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranscriptSegment;