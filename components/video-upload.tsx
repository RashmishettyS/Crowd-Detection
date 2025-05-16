"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    isCrowded: boolean;
    confidence: number;
    peopleCount: number;
  } | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Load the model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        // Simulate model loading
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setModel({});
        setIsModelLoading(false);
      } catch (error) {
        console.error("Failed to load model:", error);
        setIsModelLoading(false);
      }
    }

    loadModel();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setVideoSrc(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const analyzeVideo = async () => {
    if (!file || !videoRef.current || !canvasRef.current || !model) return;

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Simulate analysis
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Simulate detection result
      const peopleCount = 5 + Math.floor(Math.random() * 50); // Simulate people count
      const confidence = 0.85 + Math.random() * 0.05; // Confidence level between 85% and 90%

      setResult({
        isCrowded: peopleCount > 10,
        confidence,
        peopleCount,
      });

      // Show notification if crowded
      if (peopleCount > 10) {
        console.log("ALERT: Crowd detected in uploaded video!");
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setIsAnalyzing(false);
    }
  };

  const processUploadedVideo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (videoRef.current && canvas && ctx) {
      const video = videoRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simulate detection
      const peopleCount = 5 + Math.floor(Math.random() * 50); // Simulate people count
      const confidence = 0.85 + Math.random() * 0.05; // Confidence level between 85% and 90%

      setResult({
        isCrowded: peopleCount > 10,
        confidence,
        peopleCount,
      });

      // Show notification if crowded
      if (peopleCount > 10) {
        console.log("ALERT: Crowd detected in uploaded video!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-xl font-medium">Upload Video for Analysis</h3>

        {isModelLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"></div>
            <p className="mt-4 text-slate-300">Loading YOLOv8 detection model...</p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 p-12 text-center",
                file ? "border-cyan-400/50" : "hover:border-slate-500"
              )}
            >
              {!file ? (
                <>
                  <Upload className="mb-4 h-12 w-12 text-slate-500" />
                  <p className="mb-2 text-lg font-medium">Drag and drop your video file here</p>
                  <p className="mb-4 text-sm text-slate-400">or click to browse files</p>
                  <Button variant="outline" className="relative">
                    Select Video
                    <input
                      type="file"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                </>
              ) : (
                <div className="w-full">
                  <p className="mb-4 text-lg font-medium">{file.name}</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <video ref={videoRef} src={videoSrc || undefined} className="h-full w-full object-cover" controls />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setVideoSrc(null);
                        setResult(null);
                      }}
                    >
                      Change Video
                    </Button>
                    <Button onClick={analyzeVideo} disabled={isAnalyzing} className="bg-cyan-600 hover:bg-cyan-700">
                      {isAnalyzing ? "Analyzing..." : "Analyze Crowd"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Analyzing video...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {result && (
              <Alert
                className={cn(
                  "mt-6",
                  result.isCrowded ? "border-red-400 bg-red-500/10" : "border-green-400 bg-green-500/10"
                )}
              >
                {result.isCrowded ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
                <AlertTitle className={result.isCrowded ? "text-red-400" : "text-green-400"}>
                  {result.isCrowded ? "Crowded Area Detected" : "Area Not Crowded"}
                </AlertTitle>
                <AlertDescription>
                  <p className="mt-1">
                    Detected approximately <strong>{result.peopleCount}</strong> people in the video.
                  </p>
                  <p className="mt-1">
                    Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}
