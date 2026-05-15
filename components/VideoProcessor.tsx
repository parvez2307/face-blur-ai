"use client";

import { useEffect, useRef, useState } from "react";

import { createMediaPipe } from "@/lib/mediapipeDetector";

import {
  FaceBox,
  trackFaces,
} from "@/lib/tracker";

export default function VideoProcessor() {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const trackedFaces =
    useRef<FaceBox[]>([]);

  const processingRef =
    useRef(false);

  const frameCount = useRef(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const recordedChunksRef =
    useRef<Blob[]>([]);

  const lastFpsUpdate =
    useRef(performance.now());

  const framesSinceUpdate =
    useRef(0);

  const [fps, setFps] =
    useState(0);

  const [progress, setProgress] =
    useState(0);

  const [downloadURL, setDownloadURL] =
    useState<string | null>(null);

  const [detector, setDetector] =
    useState<any>(null);

  const [videoURL, setVideoURL] =
    useState<string | null>(null);

  const [isReady, setIsReady] =
    useState(false);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [status, setStatus] =
    useState("Loading AI...");

  const [blurStrength, setBlurStrength] =
    useState(0.12);

  const [blurShape, setBlurShape] =
    useState("circle");

  const [coverageScale, setCoverageScale] =
    useState(1.6);

  const [showBoxes, setShowBoxes] =
    useState(false);

  const [safeMode, setSafeMode] =
    useState(false);

  const [aiMode, setAiMode] =
    useState("auto");

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      const model =
        await createMediaPipe();

      setDetector(model);

      setIsReady(true);

      setStatus("Ready");
    } catch (error) {
      console.error(error);

      setStatus(
        "Failed to initialize"
      );
    }
  }

  function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setVideoURL(url);

    setDownloadURL(null);

    trackedFaces.current = [];

    frameCount.current = 0;

    setProgress(0);

    setStatus(
      "Video Loaded"
    );
  }

  function stopProcessing() {
    processingRef.current = false;

    setIsProcessing(false);

    setStatus("Stopped");

    mediaRecorderRef.current?.stop();
  }

  function startOver() {
    processingRef.current = false;

    setIsProcessing(false);

    setVideoURL(null);

    setDownloadURL(null);

    trackedFaces.current = [];

    frameCount.current = 0;

    setProgress(0);

    setStatus("Ready");

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  async function processVideo() {
    if (!isReady) return;

    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    processingRef.current = true;

    setIsProcessing(true);

    setStatus(
      "Processing locally..."
    );

    if (video.readyState < 2) {
      await new Promise<void>(
        (resolve) => {
          video.onloadeddata = () => {
            resolve();
          };
        }
      );
    }

    canvas.width = video.videoWidth;

    canvas.height =
      video.videoHeight;

    await video.play();

    // recorder
    const stream =
      canvas.captureStream(30);

    const recorder =
      new MediaRecorder(stream, {
        mimeType:
          "video/webm;codecs=vp9",
      });

    mediaRecorderRef.current =
      recorder;

    recordedChunksRef.current = [];

    recorder.ondataavailable = (
      event
    ) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(
          event.data
        );
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(
        recordedChunksRef.current,
        {
          type: "video/webm",
        }
      );

      const url =
        URL.createObjectURL(blob);

      setDownloadURL(url);

      setStatus(
        "Export Ready"
      );
    };

    recorder.start();

    // adaptive detection size
    let detectionWidth = 320;

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      detectionWidth = 256;
    }

    if (
      window.innerWidth > 1600
    ) {
      detectionWidth = 480;
    }

    const detectionCanvas =
      document.createElement(
        "canvas"
      );

    const detectionCtx =
      detectionCanvas.getContext(
        "2d"
      );

    if (!detectionCtx) return;

    detectionCanvas.width =
      detectionWidth;

    detectionCanvas.height =
      canvas.height *
      (detectionWidth /
        canvas.width);

    const scale =
      detectionWidth /
      canvas.width;

    const renderFrame = async () => {
      if (!processingRef.current)
        return;

      if (
        video.paused ||
        video.ended
      ) {
        processingRef.current =
          false;

        setIsProcessing(false);

        setStatus(
          "Finalizing Export..."
        );

        mediaRecorderRef.current?.stop();

        return;
      }

      frameCount.current++;

      framesSinceUpdate.current++;

      const now =
        performance.now();

      if (
        now -
          lastFpsUpdate.current >
        1000
      ) {
        const currentFPS =
          framesSinceUpdate.current;

        setFps(currentFPS);

        if (
          currentFPS < 10
        ) {
          setSafeMode(true);
        }

        framesSinceUpdate.current = 0;

        lastFpsUpdate.current =
          now;
      }

      const currentTime =
        video.currentTime;

      const duration =
        video.duration || 1;

      setProgress(
        (currentTime /
          duration) *
          100
      );

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const hasFastMotion =
        trackedFaces.current.some(
          (face) =>
            Math.abs(
              face.velocityX
            ) > 12 ||
            Math.abs(
              face.velocityY
            ) > 12
        );

      let detectEvery = 1;

      if (fps < 15) {
        detectEvery = 1;
      } else if (
        fps < 24
      ) {
        detectEvery = 1;
      } else if (
        hasFastMotion
      ) {
        detectEvery = 1;
      }

      if (safeMode) {
        detectEvery = 1;
      }

      if (
        aiMode === "fast"
      ) {
        detectEvery = 1;
      }

      if (
        aiMode ===
        "accurate"
      ) {
        detectEvery = 1;
      }

      if (
        frameCount.current %
          detectEvery ===
        0
      ) {
        detectionCtx.drawImage(
          canvas,
          0,
          0,
          detectionCanvas.width,
          detectionCanvas.height
        );

        try {
          const result =
            detector.detect(
              detectionCanvas
            );

          const detectedFaces: FaceBox[] =
            [];

          result.faceLandmarks.forEach(
            (landmarks: any) => {
              let minX = 1;
              let minY = 1;
              let maxX = 0;
              let maxY = 0;

              landmarks.forEach(
                (point: any) => {
                  minX = Math.min(
                    minX,
                    point.x
                  );

                  minY = Math.min(
                    minY,
                    point.y
                  );

                  maxX = Math.max(
                    maxX,
                    point.x
                  );

                  maxY = Math.max(
                    maxY,
                    point.y
                  );
                }
              );

              const x =
                (minX *
                  detectionWidth) /
                scale;

              const y =
                (minY *
                  detectionCanvas.height) /
                scale;

              const width =
                ((maxX - minX) *
                  detectionWidth) /
                scale;

              const height =
                ((maxY - minY) *
                  detectionCanvas.height) /
                scale;

              detectedFaces.push({
                id: -1,

                x,

                y,

                width,

                height,

                centerX:
                  x +
                  width / 2,

                centerY:
                  y +
                  height / 2,

                velocityX: 0,

                velocityY: 0,

                confidence: 1,

                life: 28,
              });
            }
          );

          trackedFaces.current =
            trackFaces(
              trackedFaces.current,
              detectedFaces
            );
        } catch (error) {
          console.error(error);
        }
      }

      trackedFaces.current.forEach(
        (face) => {
          face.x +=
            face.velocityX *
            0.18;

          face.y +=
            face.velocityY *
            0.18;

          face.centerX +=
            face.velocityX *
            0.18;

          face.centerY +=
            face.velocityY *
            0.18;

          face.confidence -=
            0.02;

          face.life--;

          blurFace(
            ctx,
            face.x,
            face.y,
            face.width,
            face.height,
            isMobile
          );
        }
      );

      trackedFaces.current =
        trackedFaces.current.filter(
          (face) =>
            face.life > 0 &&
            face.confidence > 0
        );

      video.requestVideoFrameCallback(
        () => {
          renderFrame();
        }
      );
    };

    renderFrame();
  }

  function blurFace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    isMobile: boolean
  ) {
    const padding =
      width *
      (coverageScale - 1);

    x = Math.max(
      0,
      x - padding
    );

    y = Math.max(
      0,
      y - padding
    );

    width += padding * 2;

    height += padding * 2;

    const tempCanvas =
      document.createElement(
        "canvas"
      );

    const tempCtx =
      tempCanvas.getContext(
        "2d"
      );

    if (!tempCtx) return;

    tempCanvas.width = width;

    tempCanvas.height = height;

    tempCtx.drawImage(
      ctx.canvas,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );

    tempCtx.imageSmoothingEnabled =
      false;

    const scale = isMobile
      ? 0.18 -
        blurStrength
      : 0.22 -
        blurStrength;

    const sw = Math.max(
      1,
      Math.floor(width * scale)
    );

    const sh = Math.max(
      1,
      Math.floor(height * scale)
    );

    tempCtx.drawImage(
      tempCanvas,
      0,
      0,
      width,
      height,
      0,
      0,
      sw,
      sh
    );

    tempCtx.drawImage(
      tempCanvas,
      0,
      0,
      sw,
      sh,
      0,
      0,
      width,
      height
    );

    ctx.save();

    if (
      blurShape === "circle"
    ) {
      ctx.beginPath();

      ctx.arc(
        x + width / 2,
        y + height / 2,
        Math.max(width, height) /
          2,
        0,
        Math.PI * 2
      );

      ctx.clip();
    }

    ctx.drawImage(
      tempCanvas,
      x,
      y,
      width,
      height
    );

    ctx.restore();

    if (showBoxes) {
      ctx.strokeStyle =
        "#00ff99";

      ctx.lineWidth = 3;

      ctx.strokeRect(
        x,
        y,
        width,
        height
      );
    }
  }

  return (
    <div className="space-y-6">
      {!videoURL && (
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/30 text-center">
          <div>
            <div className="mb-4 text-7xl">
              🎥
            </div>

            <h2 className="text-4xl font-black text-white">
              Upload a video
            </h2>

            <p className="mt-4 text-zinc-500">
              Fully Local •
              Privacy First •
              No Uploads to cloud
            </p>

            <label className="mt-8 inline-flex cursor-pointer rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:opacity-90">
              Choose Video

              <input
                type="file"
                accept="video/*"
                onChange={
                  handleUpload
                }
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {videoURL && (
        <>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <div>
                <div className="mb-2 text-sm text-zinc-300">
                  Blur Strength
                </div>

                <input
                  type="range"
                  min="0.03"
                  max="0.2"
                  step="0.01"
                  value={
                    blurStrength
                  }
                  onChange={(e) =>
                    setBlurStrength(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="mb-2 text-sm text-zinc-300">
                  Blur Shape
                </div>

                <select
                  value={
                    blurShape
                  }
                  onChange={(e) =>
                    setBlurShape(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                >
                  <option value="circle">
                    Circle
                  </option>

                  <option value="square">
                    Square
                  </option>
                </select>
              </div>

              <div>
                <div className="mb-2 text-sm text-zinc-300">
                  Face Coverage
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={
                    coverageScale
                  }
                  onChange={(e) =>
                    setCoverageScale(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="mb-2 text-sm text-zinc-300">
                  AI Mode
                </div>

                <select
                  value={aiMode}
                  onChange={(e) =>
                    setAiMode(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                >
                  <option value="auto">
                    Auto
                  </option>

                  <option value="fast">
                    Fast
                  </option>

                  <option value="accurate">
                    Accurate
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-right">
                  <div className="text-sm text-zinc-500">
                    FPS
                  </div>

                  <div className="text-3xl font-black text-white">
                    {fps}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                <span>
                  Processing
                  Progress
                </span>

                <span>
                  {progress.toFixed(
                    0
                  )}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                {status}
              </div>

              {safeMode && (
                <div className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm font-bold text-yellow-300">
                  Safe Mode
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={
                  processVideo
                }
                disabled={
                  isProcessing
                }
                className="rounded-2xl bg-white px-8 py-4 font-black text-black transition hover:opacity-90 disabled:opacity-40"
              >
                {isProcessing
                  ? "Processing..."
                  : "Start Blur"}
              </button>

              <button
                onClick={
                  stopProcessing
                }
                className="rounded-2xl border border-red-700 bg-red-950/40 px-8 py-4 font-black text-red-300"
              >
                Stop
              </button>

              <button
                onClick={startOver}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 font-black text-white"
              >
                Start Over
              </button>

              {downloadURL && (
                <a
                  href={
                    downloadURL
                  }
                  download="blurred-video.webm"
                  className="rounded-2xl bg-green-500 px-8 py-4 font-black text-black"
                >
                  Download
                  Video
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <div className="mb-3 text-lg font-bold text-white">
                Original Video
              </div>

              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
                <video
                  ref={videoRef}
                  src={videoURL}
                  controls
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 text-lg font-bold text-white">
                Processed Output
              </div>

              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
                <canvas
                  ref={canvasRef}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          {downloadURL && (
            <div>
              <div className="mb-3 text-lg font-bold text-white">
                Export Preview
              </div>

              <video
                src={downloadURL}
                controls
                className="w-full rounded-3xl border border-zinc-800"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}