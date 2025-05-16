import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoUpload from "@/components/video-upload"
import CctvStream from "@/components/cctv-stream"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm">
          <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
          <span>Advanced Crowd Detection Technology</span>
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Real-time <span className="text-cyan-400">Crowd Detection</span> System
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
          Monitor crowd density in real-time using our advanced AI technology. Upload videos or connect to CCTV cameras
          to get instant crowd analysis.
        </p>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-5xl rounded-xl bg-slate-800/50 p-6 backdrop-blur-sm">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="upload">Video Upload</TabsTrigger>
              <TabsTrigger value="cctv">CCTV Connection</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="focus-visible:outline-none">
              <VideoUpload />
            </TabsContent>
            <TabsContent value="cctv" className="focus-visible:outline-none">
              <CctvStream />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-slate-800/30 p-6">
            <h3 className="mb-3 text-xl font-semibold text-cyan-400">Real-time Analysis</h3>
            <p className="text-slate-300">Get instant crowd density analysis with our advanced AI algorithms.</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-6">
            <h3 className="mb-3 text-xl font-semibold text-cyan-400">Multiple Sources</h3>
            <p className="text-slate-300">Analyze footage from uploaded videos or connect directly to CCTV cameras.</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-6">
            <h3 className="mb-3 text-xl font-semibold text-cyan-400">Instant Alerts</h3>
            <p className="text-slate-300">
              Receive immediate notifications when crowd density exceeds safe thresholds.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
