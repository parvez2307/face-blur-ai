# Face Blur AI

Privacy-first AI face blur tool running entirely locally in your browser.

---

# Table of Contents

* [Live Demo](#live-demo)
* [Features](#features)
* [Privacy First](#privacy-first)
* [Screenshots](#screenshots)
* [Tech Stack](#tech-stack)
* [AI Pipeline](#ai-pipeline)
* [Tracking Engine](#tracking-engine)
* [Performance Optimizations](#performance-optimizations)
* [Supported Devices](#supported-devices)
* [Installation](#installation)
* [Production Build](#production-build)
* [Deployment](#deployment)
* [Current Limitations](#current-limitations)
* [Future Improvements](#future-improvements)
* [Phase 2 — Selective Person Blur](#phase-2--selective-person-blur)
* [Why This Project Exists](#why-this-project-exists)
* [License](#license)
* [Author](#author)

## Live Demo

Add your deployed Vercel URL here:

```text
https://face-blur-ai-five.vercel.app
```

---

# Features

* Fully local video processing
* No uploads to cloud
* AI-powered face detection
* Real-time face blur
* Adaptive tracking engine
* Mobile optimized
* Browser-based processing
* Adjustable blur strength
* Circle and square blur modes
* Adjustable privacy coverage
* Export processed video
* Download processed output
* FPS optimization
* Safe mode for low-end devices
* Responsive UI

---

# Privacy First

All processing happens entirely in your browser.

Your videos are:

* never uploaded
* never stored
* never sent to servers

This application does not use cloud inference or backend video processing.

---

# Screenshots

## Upload Screen

<p align="center">
  <img src="https://github.com/user-attachments/assets/96ffc4a7-57f3-4cb4-8c6b-5a0ce29921a6" width="50%" />
</p>

## Processing

<p align="center">
  <img src="https://github.com/user-attachments/assets/eb76e7cf-c2b3-474f-a358-84b1be7abd18" width="50%" />
</p>


## Demo Preview

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/70d9fcec-9345-4401-8ea9-1c428a5e2f22"
    width="100%"
    alt="Face Blur AI Demo"
  />
</p>
---

# Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Frontend     | Next.js                   |
| Styling      | Tailwind CSS              |
| AI Detection | MediaPipe Face Landmarker |
| Tracking     | Custom centroid tracker   |
| Rendering    | HTML5 Canvas              |
| Export       | MediaRecorder API         |
| Runtime      | Browser-only              |
| Deployment   | Vercel                    |

---

# AI Pipeline

```text
Video Upload
      ↓
Adaptive Detection Resolution
      ↓
MediaPipe Face Detection
      ↓
Tracking + Motion Prediction
      ↓
Blur Engine
      ↓
Canvas Rendering
      ↓
Video Export
```

---

# Tracking Engine

The application uses:

* centroid tracking
* motion prediction
* face persistence
* confidence decay
* adaptive detection frequency

This improves:

* blur continuity
* partial face handling
* motion stability
* performance efficiency

---

# Performance Optimizations

## Adaptive Detection

Detection frequency automatically changes based on:

* FPS
* motion speed
* device capability
* safe mode activation

---

## Low Resolution Inference

Face detection runs on a smaller detection canvas while blur is applied to the original-resolution frame.

This significantly improves:

* FPS
* battery usage
* mobile performance

---

## Safe Mode

On weaker devices, the application automatically:

* reduces detection frequency
* lowers detection resolution
* prioritizes stable FPS

---

# Supported Devices

## Desktop

* Chrome
* Edge
* Brave
* Firefox

## Mobile

* Android Chrome
* Samsung Internet
* iPhone Safari

---

# Installation

## Clone Repository

```bash
git clone https://github.com/parvez2307/face-blur-ai.git
cd face-blur-ai
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Production Build

```bash
npm run build
npm start
```

---

# Deployment

Recommended deployment:

* Vercel
* Cloudflare Pages
* Netlify

---

# Current Limitations

* WebM export only
* MP4 export not yet implemented
* MediaPipe may miss extremely occluded faces
* Browser performance varies by device

---

# Future Improvements

## Phase 2 — Selective Person Blur

Planned upgrade:

```text
Selective Identity-Aware Blur
```

Instead of blurring every detected face, users will be able to:

* select a specific person
* blur only selected individuals
* maintain identity persistence across frames
* handle motion and partial occlusion more reliably

This phase requires a significantly more advanced AI pipeline.

### Planned Architecture

```text
Face Detection
      ↓
Tracking
      ↓
Face Embeddings
      ↓
Identity Matching
      ↓
Selective Blur
```

### Planned Technology Stack

| Component         | Planned Upgrade          |
| ----------------- | ------------------------ |
| Detection         | SCRFD                    |
| Tracking          | ByteTrack-style tracking |
| Identity Matching | Face Embeddings          |
| Embedding Models  | ArcFace / MobileFaceNet  |
| Runtime           | ONNX Runtime Web         |
| Acceleration      | WebGPU                   |

### Planned Features

* selective person blur
* persistent face IDs
* better partial-face handling
* side-profile stability
* re-identification after occlusion
* improved tracking continuity
* adaptive high-accuracy mode

### Engineering Challenges

This phase introduces:

* identity persistence
* embedding similarity matching
* re-identification logic
* advanced multi-object tracking
* browser inference optimization

The application evolves from:

```text
privacy utility
```

into:

```text
browser-native video analytics system
```

---

## Planned

* SCRFD integration
* WebGPU acceleration
* MP4 export
* ffmpeg.wasm pipeline
* Web Worker inference
* Optical flow tracking
* Multi-face identity persistence
* Selective face blur

---

# Why This Project Exists

Most online face blur tools upload videos to servers.

This project was built to provide:

* local-first privacy
* browser-native AI processing
* mobile-friendly performance
* accessible privacy tooling

without requiring cloud uploads.

---

# License

MIT License

---

# Author

Parvez

GitHub:

```text
https://github.com/parvez2307
```
