import * as ort from "onnxruntime-web";

export async function createSCRFD() {
  const session =
    await ort.InferenceSession.create(
      "/models/det_2.5g.onnx",
      {
        executionProviders: [
          "wasm",
        ],
      }
    );

  return session;
}
