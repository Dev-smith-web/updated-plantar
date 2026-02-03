# PlantAR: An Interactive AR Learning Tool

### University of North Texas — CSCE 4901 Capstone Project  
**Team:** Yogesh Ayer, Yam Karki, Diya Chataut, Abhie Koirala, Ashish Pudasaini  
**Sponsor:** Dr. Stephanie Ludi  
**Semester:** Fall 2025  

---

## Overview

PlantAR is an Augmented Reality (AR) mobile application designed to help elementary and middle school students (ages 8–14) explore plant biology in an engaging, hands-on way.  
By pointing their mobile device at a printed target image, students can view and interact with a 3D model of a plant — rotating, zooming, and tapping on individual parts (roots, stem, leaves, flowers) to reveal their names and functions.

This project combines Unity (AR Foundation) for AR functionality and React Native (Expo) for the front-end interface. The team follows an agile process to deliver incremental, testable features each sprint.

---

## Problem Statement

Traditional science education relies on static 2D textbook images to explain complex plant structures, which often fails to engage students or foster retention. PlantAR transforms this experience by offering interactive 3D AR environments that improve understanding, motivation, and long-term learning outcomes through immersive exploration and assessment.

## Current Status
Sprint	Focus	Key Deliverables	Status
Sprint 0	Planning and Setup	Requirements, architecture, GitHub repositories, Trello board	 Completed
Sprint 1	AR Foundations	Image tracking, 3D model rendering, UI wireframes	Completed
Sprint 2	Interactivity and Usability	Tap interactions, info panels, floating labels	 Completed
Sprint 3	Platform Migration & Assessment	Dual-platform architecture, quiz system, progress tracking, web deployment	 Completed
Sprint 3 Key Outcomes:

Successfully migrated from Unity to native iOS (Swift/ARKit) and web (WebXR/Three.js)

Implemented comprehensive assessment system with quizzes and progress tracking

Established Blender 3D pipeline with USDZ/GLTF dual-format export

Deployed production-ready applications on both platforms

Achieved WCAG 2.0 AA accessibility compliance

---

## System Requirements

Dual-Platform Architecture:
Native iOS Application:

Devices: iPhone or iPad with iOS 14+ and ARKit compatibility
Development: Xcode 15+, Swift 5.9+
AR Framework: ARKit 6.0+, SceneKit
Deployment: TestFlight for testing, App Store for distribution

Web Application:
Browsers: Safari 15+, Chrome 90+, or other WebXR-compatible browsers
Development: React 18+, Three.js r152+, WebXR API
Deployment: HTTPS-enabled hosting with PWA support

3D Model Pipeline:
Software: Blender 3.6+
Export Formats: USDZ (iOS), GLTF/GLB (web)
Textures: PBR materials optimized for both platforms

---

## Core Features (MVP)

| ID | Feature | Description |
|----|----------|-------------|
| F1 | Image Tracking | Recognize printed target image using AR camera |
| F2 | 3D Model Rendering | Render and anchor a 3D plant model on tracked target |
| F3 | Model Manipulation | Rotate and zoom model via touch gestures |
| F4 | Interactive Parts | Tap on roots, stem, leaves, or flower |
| F5 | Information Display | Pop-up panel showing name and function of plant part |

## Sprint 3 Enhancement Features:
ID	Feature	Description
F6	Quiz Assessment System	Interactive quizzes with immediate feedback
F7	Progress Tracking	User progress visualization and achievement system
F8	Multi-Plant Library	Browse and select from plant collection
F9	Cross-Platform Sync	Firebase-powered synchronization between iOS and web
F10	Web AR Accessibility	Markerless AR experience via browser

---

## Architecture Overview

Dual-Platform Architecture:
Native iOS Stack:
Language: Swift 5.9
AR Framework: ARKit 6.0, SceneKit
UI Framework: SwiftUI
Architecture: MVVM (Model-View-ViewModel)
Data Persistence: Core Data + Firebase Firestore

Web Application Stack:
Frontend: React 18, TypeScript
3D Graphics: Three.js r152+, WebXR API
Build Tool: Vite
PWA Features: Service Workers, Web App Manifest
Styling: CSS Modules, Tailwind CSS

Backend & Shared Services:
Database: Firebase Firestore
Authentication: Firebase Auth
Storage: Firebase Storage (3D models)
Analytics: Firebase Analytics
Hosting: Firebase Hosting (web app)

3D Development Pipeline:
Modeling: Blender 3.6+
iOS Export: USDZ format with AR Quick Look compatibility
Web Export: GLTF/GLB format with Draco compression
Texture Format: PBR materials (Albedo, Normal, Roughness/Metallic)

Design Patterns:
Service Locator Pattern (iOS)
Observer Pattern (Cross-platform events)
MVVM Architecture (iOS)
Component-Based Architecture (Web)
Repository Pattern (Data access)

---

## Test Plan Summary

**Objectives**
- Validate AR tracking accuracy, 3D rendering, and interactive behavior.  
- Verify usability and accessibility for children ages 8–14.  
- Ensure consistent performance (≥ 30 FPS, < 3 s model load time).
- Confirm cross-platform data synchronization reliability
- Validate accessibility compliance (WCAG 2.0 AA)  

**Testing Strategy**
- UiOS Testing: XCTest (unit/UI), XCUITest, ARKit session testing
- Web Testing: Jest (unit), Cypress (E2E), Cross-browser compatibility
- Integration Testing: Firebase services, 3D model pipeline
- User Acceptance Testing: Classroom testing with target age group
- Performance Testing: FPS monitoring, load time validation, memory profiling

**Environment**
- iOS: Xcode 15+, iPhone 8 or later (iOS 14+), TestFlight
- Web: Node.js 18+, Safari 15+, Chrome 90+, Firebase Emulator Suite
- 3D Pipeline: Blender 3.6+, glTF Validator, USDZ Tools

---

## Setup Instructions (Unity + AR)

1. Install **Unity 2021.3 LTS** (or later).  
2. Add required packages via **Package Manager**:  
   - AR Foundation  
   - ARKit XR Plugin  
   - ARCore XR Plugin (optional for Android)  
3. Clone the repository:  
   ```bash
   git clone https://github.com/<your-username>/PlantAR.git
   cd PlantAR
Open the project in Unity and switch platform to iOS.
Build and deploy to device using Xcode.
Running the React Native (Expo) UI
cd plantar-ui-main
npm install
npx expo start --tunnel -c
To Test:
Download Expo Go from the App Store.
Scan the QR code displayed in the terminal.
The PlantAR UI will load instantly on your device.

Trello Board : https://trello.com/b/FZhfAA0v/ar-science-tool



