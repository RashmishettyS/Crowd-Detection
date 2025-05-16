"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2, Camera, Loader2, Bell, BellOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Demo CCTV streams (in a real app, these would be actual RTSP URLs)
const DEMO_STREAMS = [
  { id: "cam1", name: "Main Entrance", url: "/placeholder.svg?height=720&width=1280" },
  { id: "cam2", name: "Lobby Area", url: "/placeholder.svg?height=720&width=1280" },
  { id: "cam3", name: "Food Court", url: "/placeholder.svg?height=720&width=1280" },
]

const CCTVStream = ({ streamUrl }: { streamUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isStreamValid, setIsStreamValid] = useState<boolean>(false); // Track if the stream is valid
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // Track if analysis is running
  const [usingFallback, setUsingFallback] = useState<boolean>(false); // Track if fallback mode is active

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.src = streamUrl;

      // Handle video errors
      const handleVideoError = () => {
        setIsStreamValid(false);
        setAlertMessage("Stream is unreachable. Please check the URL.");
        setIsAnalyzing(false); // Stop analysis
        setUsingFallback(false); // Disable fallback mode if stream is unreachable
      };

      // Handle video loaded successfully
      const handleVideoLoaded = () => {
        setIsStreamValid(true);
        setAlertMessage(""); // Clear any previous error messages
        setIsAnalyzing(true); // Start analysis
        setUsingFallback(false); // Ensure fallback is disabled
      };

      videoElement.addEventListener("error", handleVideoError);
      videoElement.addEventListener("loadeddata", handleVideoLoaded);

      videoElement.play();

      const analyzeFrame = () => {
        if (!isStreamValid || !isAnalyzing || usingFallback) return; // Skip analysis if invalid or in fallback mode

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          // Draw the current video frame onto the canvas
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Get pixel data from the frame
          const frameData = context.getImageData(0, 0, canvas.width, canvas.height).data;

          // Calculate the average pixel intensity
          const totalPixels = frameData.length / 4; // Each pixel has 4 values (RGBA)
          let sumIntensity = 0;

          for (let i = 0; i < frameData.length; i += 4) {
            const r = frameData[i];
            const g = frameData[i + 1];
            const b = frameData[i + 2];
            const intensity = (r + g + b) / 3; // Average intensity of RGB
            sumIntensity += intensity;
          }

          const avgIntensity = sumIntensity / totalPixels;

          // If the average intensity is too low (e.g., below 10), consider the frame as black
          if (avgIntensity < 10) {
            setAlertMessage("No valid video feed detected.");
            return;
          }

          // Simulate model analysis (replace this with actual model logic)
          const isCrowded = Math.random() > 0.5; // Replace with actual model output
          setAlertMessage(isCrowded ? "Crowded area detected!" : "Area is not crowded.");
        }
      };

      const intervalId = setInterval(analyzeFrame, 1000); // Analyze frame every second

      return () => {
        clearInterval(intervalId);
        videoElement.removeEventListener("error", handleVideoError);
        videoElement.removeEventListener("loadeddata", handleVideoLoaded);
      };
    }
  }, [streamUrl, isStreamValid, isAnalyzing, usingFallback]);

  const getIframeUrl = (videoUrl: string) => {
    // For IP Webcam, the browser view URL is typically at /video
    return videoUrl.replace("/videofeed", "/video").replace(/\/?$/, "/video");
  };

  const handleFallbackError = () => {
    setAlertMessage("Fallback mode failed. Stream is unreachable.");
    setUsingFallback(false); // Disable fallback mode if iframe fails
    setIsAnalyzing(false); // Stop analysis
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-950">
        {!usingFallback ? (
          <video
            ref={videoRef}
            key={`video-${streamUrl}`} // Key helps force reload when URL changes
            src={streamUrl}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted
            onError={() => setUsingFallback(true)} // Switch to fallback on error
          />
        ) : (
          <iframe
            ref={iframeRef}
            key={`iframe-${streamUrl}`}
            src={getIframeUrl(streamUrl)}
            className="h-full w-full border-0"
            title="IP Webcam Stream"
            allowFullScreen
            onError={handleFallbackError} // Handle iframe errors
          />
        )}
      </div>
      <p>{alertMessage}</p>
    </div>
  );
};

export default function CctvStream() {
  const [streamUrl, setStreamUrl] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [crowdStatus, setCrowdStatus] = useState<{
    isCrowded: boolean
    confidence: number
    peopleCount: number
    timestamp: string
  } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [model, setModel] = useState<any>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [streamType, setStreamType] = useState<"rtsp" | "http">("http") // Default to HTTP for IP Webcam
  const [usingFallback, setUsingFallback] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load the model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        // In a real implementation, we would load YOLOv8 model
        // For this demo, we'll simulate model loading
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setModel({})
        setIsModelLoading(false)
      } catch (error) {
        console.error("Failed to load model:", error)
        setIsModelLoading(false)
      }
    }

    loadModel()
  }, [])

  const disconnectFromStream = () => {
    setIsConnected(false)
    setIsAnalyzing(false)
    setCrowdStatus(null)
    setUsingFallback(false)
    setErrorMessage(null)
  }

  // Process video frames
  const processVideoFrames = () => {
    if (!isConnected || !model) return;

    // If we're using the fallback iframe, simulate detection
    if (usingFallback) {
      // Simulate detection for iframe fallback
      const peopleCount = 5 + Math.floor(Math.random() * 50); // Simulate people count
      const confidence = 0.7 + Math.random() * 0.25;

      setCrowdStatus({
        isCrowded: peopleCount > 10, // Correctly set isCrowded based on peopleCount
        confidence,
        peopleCount,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Show notification if crowded and alerts are enabled
      if (peopleCount > 10 && alertsEnabled) {
        console.log("ALERT: Crowd detected in iframe mode!");
      }
      return;
    }

    // Process video element if not using fallback
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    // Check if video is playing and has dimensions
    if (video.readyState >= 2 && video.videoWidth > 0 && ctx && canvas) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simulate detection
      const peopleCount = 5 + Math.floor(Math.random() * 50); // Simulate people count
      const confidence = 0.7 + Math.random() * 0.25;

      setCrowdStatus({
        isCrowded: peopleCount > 10, // Correctly set isCrowded based on peopleCount
        confidence,
        peopleCount,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Show notification if crowded and alerts are enabled
      if (peopleCount > 10 && alertsEnabled) {
        console.log("ALERT: Crowd detected!");
      }
    }
  }

  // Process frames at regular intervals
  useEffect(() => {
    if (!isConnected || !model) return

    // Process frames at a reasonable rate (every 2 seconds for crowd detection)
    const processingInterval = setInterval(processVideoFrames, 2000)

    // Run once immediately after a short delay
    const initialProcessTimeout = setTimeout(() => {
      processVideoFrames()
    }, 2000)

    return () => {
      clearInterval(processingInterval)
      clearTimeout(initialProcessTimeout)
    }
  }, [isConnected, model, alertsEnabled, usingFallback])

  // Function to get the correct iframe URL from the video URL
  const getIframeUrl = (videoUrl: string) => {
    // For IP Webcam, the browser view URL is typically at /video
    return (
      videoUrl
        .replace("/videofeed", "/video")
        .replace("/video.mjpeg", "/video")
        // If URL doesn't end with /video, add it
        .replace(/\/?$/, (match) => (match ? "/video" : "/video"))
    )
  }

  const connectToStream = async () => {
    if (!streamUrl) return

    setIsConnecting(true)
    setErrorMessage(null)

    try {
      // For IP Webcam, we need to handle different URL formats
      let finalStreamUrl = streamUrl

      // If it's an IP Webcam URL but doesn't end with the right path
      if (streamType === "http") {
        // Clean up URL first (remove trailing slashes)
        finalStreamUrl = finalStreamUrl.replace(/\/+$/, "")

        // If URL doesn't already have a specific endpoint, add /videofeed
        if (
          !finalStreamUrl.includes("/videofeed") &&
          !finalStreamUrl.includes("/video.mjpeg") &&
          !finalStreamUrl.includes("/video")
        ) {
          finalStreamUrl = `${finalStreamUrl}/videofeed`
        }
        // If URL ends with /video, it might work better with /videofeed for direct video element
        else if (finalStreamUrl.endsWith("/video")) {
          finalStreamUrl = finalStreamUrl.replace("/video", "/videofeed")
        }
      }

      // In a real implementation, we would test the connection
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStreamUrl(finalStreamUrl) // Update with the corrected URL
      setIsConnected(true)
      setIsAnalyzing(true)
      setUsingFallback(false) // Start with direct video approach
    } catch (error) {
      console.error("Failed to connect to stream:", error)
      setErrorMessage("Failed to connect to stream. Please check the URL and try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const selectDemoStream = (streamId: string) => {
    const stream = DEMO_STREAMS.find((s) => s.id === streamId)
    if (stream) {
      setSelectedDemo(streamId)
      setStreamUrl(`http://demo/${streamId}`) // Simulated HTTP URL
    }
  }

  // Handle video error and switch to iframe fallback
  const handleVideoError = () => {
    console.log("Video failed to load, switching to iframe fallback")
    setUsingFallback(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-xl font-medium">Connect to Camera Stream</h3>

        {isModelLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"></div>
            <p className="mt-4 text-slate-300">Loading YOLOv8 detection model...</p>
          </div>
        ) : (
          <>
            {!isConnected ? (
              <>
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="stream-url">Camera Stream URL</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="http"
                            name="streamType"
                            value="http"
                            checked={streamType === "http"}
                            onChange={() => setStreamType("http")}
                            className="text-cyan-600 focus:ring-cyan-500"
                          />
                          <Label htmlFor="http">HTTP (IP Webcam)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="rtsp"
                            name="streamType"
                            value="rtsp"
                            checked={streamType === "rtsp"}
                            onChange={() => setStreamType("rtsp")}
                            className="text-cyan-600 focus:ring-cyan-500"
                          />
                          <Label htmlFor="rtsp">RTSP</Label>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          id="stream-url"
                          placeholder={
                            streamType === "http"
                              ? "http://192.168.x.x:8080/video"
                              : "rtsp://username:password@camera-ip:port/stream"
                          }
                          value={streamUrl}
                          onChange={(e) => setStreamUrl(e.target.value)}
                          className="flex-1 bg-slate-800 text-white border-slate-700"
                        />
                        <Button
                          onClick={connectToStream}
                          disabled={!streamUrl || isConnecting}
                          className="bg-cyan-600 hover:bg-cyan-700 min-w-[120px]"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting
                            </>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      For IP Webcam app, use: http://[your-phone-ip]:8080/video
                    </p>

                    {errorMessage && (
                      <Alert variant="destructive" className="mt-2 bg-red-900/20 border-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="mb-3 text-sm font-medium text-slate-400">Or select a demo camera:</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {DEMO_STREAMS.map((stream) => (
                      <div
                        key={stream.id}
                        className={cn(
                          "flex cursor-pointer flex-col items-center rounded-lg border border-slate-700 p-4 transition-colors",
                          selectedDemo === stream.id
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "hover:border-slate-600 hover:bg-slate-800/50",
                        )}
                        onClick={() => selectDemoStream(stream.id)}
                      >
                        <Camera className="mb-2 h-8 w-8 text-slate-400" />
                        <span className="text-center text-sm">{stream.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {selectedDemo ? DEMO_STREAMS.find((s) => s.id === selectedDemo)?.name : "Connected to Camera"}
                    </h4>
                    <p className="text-sm text-slate-400">{streamUrl}</p>
                    {usingFallback && (
                      <p className="text-xs text-amber-400 mt-1">Using browser view mode for compatibility</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={disconnectFromStream}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-950">
                  {selectedDemo ? (
                    <img
                      src={DEMO_STREAMS.find((s) => s.id === selectedDemo)?.url || "/placeholder.svg"}
                      alt="Camera Feed"
                      className="h-full w-full object-cover"
                    />
                  ) : streamType === "http" ? (
                    <div className="h-full w-full">
                      {/* Only show video if not using fallback */}
                      {!usingFallback ? (
                        <video
                          ref={videoRef}
                          key={`video-${streamUrl}`} // Key helps force reload when URL changes
                          src={streamUrl}
                          className="h-full w-full object-cover"
                          autoPlay
                          playsInline
                          muted
                          onError={handleVideoError}
                        />
                      ) : null}

                      {/* Show iframe if using fallback */}
                      {usingFallback ? (
                        <iframe
                          ref={iframeRef}
                          key={`iframe-${streamUrl}`}
                          src={getIframeUrl(streamUrl)}
                          className="h-full w-full border-0"
                          title="IP Webcam Stream"
                          allowFullScreen
                        />
                      ) : null}

                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="h-full w-full">
                      <video
                        ref={videoRef}
                        src={streamUrl}
                        className="h-full w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* Overlay for crowd indicators */}
                  {crowdStatus && (
                    <div className="absolute bottom-4 right-4 max-w-xs rounded-lg bg-black/70 p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn("h-3 w-3 rounded-full", crowdStatus.isCrowded ? "bg-red-500" : "bg-green-500")}
                        />
                        <span className="text-sm font-medium">{crowdStatus.isCrowded ? "Crowded" : "Normal"}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300">People count: {crowdStatus.peopleCount}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id="alerts" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
                    <Label htmlFor="alerts" className="flex items-center">
                      {alertsEnabled ? (
                        <Bell className="mr-2 h-4 w-4 text-cyan-400" />
                      ) : (
                        <BellOff className="mr-2 h-4 w-4 text-slate-400" />
                      )}
                      Crowd Alerts
                    </Label>
                  </div>
                  <span className="text-sm text-slate-400">Last updated: {crowdStatus?.timestamp || "N/A"}</span>
                </div>

                {crowdStatus && (
                  <Alert
                    className={cn(
                      "mt-2",
                      crowdStatus.isCrowded ? "border-red-400 bg-red-500/10" : "border-green-400 bg-green-500/10",
                    )}
                  >
                    {crowdStatus.isCrowded ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    )}
                    <AlertTitle className={crowdStatus.isCrowded ? "text-red-400" : "text-green-400"}>
                      {crowdStatus.isCrowded ? "Crowded Area Detected" : "Area Not Crowded"}
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mt-1">
                        Detected approximately <strong>{crowdStatus.peopleCount}</strong> people in the video.
                      </p>
                      <p className="mt-1">
                        Confidence: <strong>{(crowdStatus.confidence * 100).toFixed(1)}%</strong>
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-xl font-medium">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">1</div>
            <div>
              <h4 className="font-medium">Connect to Video Source</h4>
              <p className="text-sm text-slate-400">
                Upload a video file or connect to a camera using HTTP (IP Webcam) or RTSP stream URL.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">2</div>
            <div>
              <h4 className="font-medium">YOLOv8 Analysis</h4>
              <p className="text-sm text-slate-400">
                Our YOLOv8 machine learning model analyzes the video frames to detect and count people.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">3</div>
            <div>
              <h4 className="font-medium">Crowd Assessment</h4>
              <p className="text-sm text-slate-400">
                The system determines if the area is crowded based on people count and density metrics.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">4</div>
            <div>
              <h4 className="font-medium">Real-time Alerts</h4>
              <p className="text-sm text-slate-400">
                Receive instant notifications when crowd levels exceed safe thresholds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
