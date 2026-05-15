import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export async function createMediaPipe() {
  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

  return await FaceLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },

      runningMode: "IMAGE",

      numFaces: 10,

      minFaceDetectionConfidence:
        0.15,

      minFacePresenceConfidence:
        0.15,

      minTrackingConfidence:
        0.15,
    }
  );
}