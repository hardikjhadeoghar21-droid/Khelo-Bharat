'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Video, Camera, Circle, Radio, Check, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { SitupCounter, FormError as SitupFormError, VALIDATION_ERROR_MESSAGES as SITUP_VALIDATION_ERROR_MESSAGES } from '@/lib/ai/situp-counter';
import { HighJumpAnalyzer, FormError as HighJumpFormError, VALIDATION_ERROR_MESSAGES as HIGHJUMP_VALIDATION_ERROR_MESSAGES } from '@/lib/ai/high-jump-analyzer';
import { createPoseLandmarker } from '@/lib/ai/pose-landmarker';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirestore, useStorage, errorEmitter, FirestorePermissionError, addDocumentNonBlocking } from '@/firebase';

type AnalysisState = 'idle' | 'recording' | 'preview' | 'saving' | 'initializing';
type ExerciseAnalyzer = SitupCounter | HighJumpAnalyzer;

const VALIDATION_ERROR_MESSAGES = { ...SITUP_VALIDATION_ERROR_MESSAGES, ...HIGHJUMP_VALIDATION_ERROR_MESSAGES };
type FormError = SitupFormError | HighJumpFormError;

export function VideoSubmission({ exerciseType }: { exerciseType: string }) {
  const { user, profile } = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();

  const [analysisState, setAnalysisState] = useState<AnalysisState>('initializing');
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>(0);
  
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const exerciseAnalyzerRef = useRef<ExerciseAnalyzer | null>(null);
  
  const [result, setResult] = useState(0); // Reps for sit-ups, height for jump
  const [score, setScore] = useState(0);
  const [formErrors, setFormErrors] = useState<Set<FormError>>(new Set());
  const lastFormErrorRef = useRef<FormError | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        const landmarker = await createPoseLandmarker();
        setPoseLandmarker(landmarker);
        setAnalysisState('idle');
      } catch (error) {
        console.error("Failed to initialize Pose Landmarker", error);
        toast({
          variant: 'destructive',
          title: 'AI Model Error',
          description: 'Could not load the local AI model. Please refresh the page.'
        });
        setAnalysisState('idle');
      }
    }
    initialize();
  }, [toast]);

  const startPoseDetection = () => {
    if (!poseLandmarker || !videoRef.current || videoRef.current.readyState < 2) {
      return;
    }
    
    const video = videoRef.current;
    if (!exerciseAnalyzerRef.current) {
        if (exerciseType === 'sit ups') {
            exerciseAnalyzerRef.current = new SitupCounter((count) => setResult(count));
        } else if (exerciseType === 'high jump') {
            exerciseAnalyzerRef.current = new HighJumpAnalyzer((height) => setResult(height), profile?.height || 170);
        }
    }

    const detect = () => {
      if (video.paused || video.ended) {
          return;
      }
      const startTimeMs = performance.now();
      const results = poseLandmarker.detectForVideo(video, startTimeMs);
      
      if (exerciseAnalyzerRef.current) {
          const { errors } = exerciseAnalyzerRef.current.process(results.landmarks);
          if (errors.size > 0) {
            const lastError = Array.from(errors).pop()!; // Get the most recent error
            if (lastError !== lastFormErrorRef.current) {
               lastFormErrorRef.current = lastError;
               setFormErrors(errors);
            }
          } else {
             lastFormErrorRef.current = null;
             setFormErrors(new Set());
          }
      }
      
      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    async function getCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
                videoRef.current.play();
            }
          }
        }
      } catch (error) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser to use this feature.',
        });
      }
    }
    getCameraPermission();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleStartRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
        
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.start();
        setResult(0);
        setScore(0);
        setFormErrors(new Set());
        lastFormErrorRef.current = null;

        if (exerciseType === 'sit ups') {
            exerciseAnalyzerRef.current = new SitupCounter(setResult);
        } else if (exerciseType === 'high jump') {
            exerciseAnalyzerRef.current = new HighJumpAnalyzer(setResult, profile?.height || 170);
        }
        setAnalysisState('recording');
        startPoseDetection();
    }
  };

  const handleStopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    const finalScore = exerciseType === 'sit ups' ? result * 10 : Math.round(result);
    setScore(finalScore);
    setAnalysisState('preview');
  };

  const resetTest = () => {
    setResult(0);
    setScore(0);
    setFormErrors(new Set());
    lastFormErrorRef.current = null;
    exerciseAnalyzerRef.current = null;
    setAnalysisState('idle');
  };

  const handleSaveResult = () => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save results.' });
      return;
    }
    setAnalysisState('saving');
  
    const repCount = exerciseType === 'sit ups' ? result : (result > 0 ? 1 : 0);
    
    const testData = {
      athleteId: user.uid,
      testType: exerciseType,
      testDateTime: serverTimestamp(),
      score: score,
      videoUrl: '',
      repCount: repCount,
      aiFeedback: formErrors.size > 0 ? Array.from(formErrors).map(e => VALIDATION_ERROR_MESSAGES[e]).join(', ') : 'Good form!',
      isValid: result > 0,
    };
    
    const testsCollectionRef = collection(firestore, 'tests');
    
    const promise = addDocumentNonBlocking(testsCollectionRef, testData);

    promise.then(docRef => {
        if (!docRef) return; // Error was handled by the non-blocking function

        toast({
            title: 'Test Complete!',
            description: `Your score of ${score} has been saved.`,
        });
        router.push('/dashboard');

        if (recordedChunksRef.current.length > 0) {
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const videoId = `${docRef.id}.webm`;
            const storageRef = ref(storage, `submissions/${user.uid}/${videoId}`);
            
            uploadBytes(storageRef, videoBlob).then(snapshot => {
                getDownloadURL(snapshot.ref).then(downloadURL => {
                    updateDoc(docRef, { videoUrl: downloadURL });
                });
            }).catch(error => {
                console.error("Background video upload failed:", error);
                updateDoc(docRef, { videoUrl: 'upload-failed' });
            });
        }
    }).catch(e => {
        // This secondary catch is for any non-permission error during the addDoc promise chain
        // The permission error is already handled inside addDocumentNonBlocking
        console.error("An unexpected error occurred while saving the test:", e);
        setAnalysisState('preview');
    });
  };

  const renderContent = () => {
    if (analysisState === 'initializing') {
        return (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="font-semibold text-lg">Initializing Local AI...</p>
          </div>
        );
    }

    if (hasCameraPermission === false) {
      return (
        <Alert variant="destructive">
          <Camera className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please grant camera permission in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      );
    }
      
    switch(analysisState) {
        case 'recording':
            return (
                <div className="text-center space-y-4">
                    <p className="font-semibold text-lg flex items-center justify-center gap-2">
                        <Radio className="text-red-500 animate-pulse" /> Recording...
                    </p>
                    <Button onClick={handleStopRecording} variant="destructive">
                        <Circle className="mr-2 h-4 w-4 fill-current" /> Stop Test
                    </Button>
                </div>
            );
        case 'preview':
            const previewValue = exerciseType === 'sit ups' ? result : result.toFixed(2);
            const previewUnit = exerciseType === 'sit ups' ? 'Reps' : 'cm';
            return (
                 <div className="space-y-4 text-center">
                    <p className="font-semibold text-lg">Test Complete!</p>
                    <div className='flex justify-center items-baseline gap-4'>
                        <div>
                            <p className="text-muted-foreground">{previewUnit}</p>
                            <p className="text-4xl font-bold">{previewValue}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Score</p>
                            <p className="text-4xl font-bold text-primary">{score}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-center pt-4">
                       <Button onClick={handleSaveResult}>
                        <Check className="mr-2 h-4 w-4" /> Save Result
                       </Button>
                       <Button variant="outline" onClick={resetTest}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                       </Button>
                    </div>
                </div>
            );
        case 'saving':
            return (
                <div className="text-center space-y-4">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="font-semibold text-lg">Saving Your Score...</p>
                    <p className="text-sm text-muted-foreground">You can safely navigate away.</p>
                </div>
            );
        case 'idle':
        default:
            return (
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                    <p className="text-muted-foreground mb-4">Position yourself correctly and click below to begin the test.</p>
                    <Button onClick={handleStartRecording} size="lg" disabled={!poseLandmarker}>
                        <Video className="mr-2 h-5 w-5" />
                         Start Test
                    </Button>
                </div>
            );
    }
  };
  
  const lastError = lastFormErrorRef.current ? VALIDATION_ERROR_MESSAGES[lastFormErrorRef.current] : null;

  const liveResult = exerciseType === 'sit ups' 
    ? `Reps: ${result}` 
    : `Jump Height: ${result.toFixed(2)} cm`;

  return (
    <Card className="min-h-[24rem] flex items-center justify-center">
      <CardContent className="pt-6 w-full max-w-md">
        <div className="w-full aspect-video bg-black rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             
             {analysisState === 'recording' && (
                <div className="absolute top-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md font-semibold">
                    {liveResult}
                </div>
             )}

             {analysisState === 'recording' && lastError && (
                 <div className="absolute bottom-2 left-2 right-2 bg-destructive/80 text-destructive-foreground text-center text-xs px-2 py-1 rounded-md">
                    {lastError}
                 </div>
             )}
             
             {hasCameraPermission === null && (
                <div className="text-center text-white space-y-4">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p>Requesting camera...</p>
                </div>
             )}
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
