import VideoProcessor from "@/components/VideoProcessor";

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black tracking-tight">
          Face Blur AI
        </h1>

        <p className="mt-3 text-zinc-500">
          Fully Local • Privacy First • No Uploads to cloud
        </p>

        <div className="mt-10">
          <VideoProcessor />
        </div>
      </div>
    </main>
  );
}