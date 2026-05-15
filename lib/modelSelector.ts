export function shouldUseSCRFD() {
  const ram =
    (navigator as any)
      .deviceMemory || 4;

  const cores =
    navigator.hardwareConcurrency || 4;

  const hasWebGPU =
    "gpu" in navigator;

  return (
    ram >= 8 &&
    cores >= 8 &&
    hasWebGPU
  );
}
