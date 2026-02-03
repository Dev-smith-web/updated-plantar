# PlantAR — Product Requirements

## 1) Project Overview

**Problem:** Plant biology is often taught with static textbook images, which can be hard for students to understand and not very engaging — especially for complex 3D structures and relationships between parts (roots, stems, leaves, flowers).

**Proposed Solution:** **PlantAR** is a mobile Augmented Reality (AR) learning app that lets elementary and middle school students explore **interactive 3D plant models**. When the student points their device camera at a **predefined target image**, a plant model appears in the real world. Students can **rotate**, **zoom**, and **tap** on parts to learn names and short, age-appropriate functions.

**Outcome:** More engaging, memorable, and intuitive learning through hands-on exploration.

---

## 2) Objectives & Success Criteria

### Primary objectives

- Help students understand plant structure through interactive 3D visualization.
- Make learning engaging and accessible for ages 8-14.

### Success indicators (implied by requirements)

- A child can learn the core flow within **2 minutes without a tutorial**.
- Touch interactions feel responsive (**<100ms gesture latency** target).
- AR experience is smooth (**>=30 FPS** on supported mid-range iOS devices).
- Biological info is accurate and sponsor-verified (by Dr. Ludi).

---

## 3) Target Users

### Primary Users — Students (Ages 8-14)

- **Goal:** Learn plant structures using interactive 3D models.
- **Skill level:** Novice; familiar with tap, swipe, pinch.
- **Reading level:** 3rd-8th grade; needs short and clear explanations.
- **Needs:** Simple UI, quick feedback, smooth performance.
- **Accessibility:** High contrast, readable fonts, intuitive icons.

### Secondary Users — Teachers

- **Goal:** Use PlantAR as a classroom supplement for plant biology lessons.
- **Skill level:** Moderate; comfortable with mobile learning apps.
- **Needs:** Preview models, select plants, explain parts easily.
- **Accessibility:** Ability to adjust explanations or add notes for students.

---

## 4) System Requirements

### 4.1 Hardware

- **Device:** iOS devices supporting ARKit 4.0+ (e.g., iPhone 8 or later).
- **Camera:** Required for AR image tracking.

### 4.2 Software / Development Stack

- **Development platform:** Unity 2021.3 LTS or later
- **Frameworks:** AR Foundation, ARKit XR Plugin
- **3D assets:** Realistic sunflower model + reference target images
- **Deployment (Sprint 2):** iOS testing build only (.ipa). **No Android build during Sprint 2.**

### 4.3 Additional Tools

- Figma — UI/UX wireframes and prototypes
- Trello — sprint tracking and collaboration
- GitHub — version control and documentation

---

## 5) Feature List (High-Level)

- **F1: Image Tracking** — Recognize a predefined physical target image.
- **F2: 3D Model Rendering** — Render a 3D plant model anchored/locked to the target image.
- **F3: Model Manipulation** — Rotate and zoom model using touch gestures.
- **F4: Interactive Parts** — Tap plant parts (root, stem, leaf, flower).
- **F5: Information Display** — Show a pop-up panel with part name + brief description.
- **F6: Plant Selection (Future)** — Menu to select from multiple plants (beyond MVP).

---

## 6) Functional Requirements (User Stories)

| ID | User Story | Description | Priority |
|----|---------------------|---------------------------------------------------------------------------------------------------------------|----------|
| R1 | View Plant Model | As a student, I want to point my phone camera at a target image so a 3D plant model appears in the real world. | 1 |
| R2 | Rotate Model | As a student, I want to drag on the screen so I can rotate the plant model and view it from all angles. | 1 |
| R3 | Zoom Model | As a student, I want to pinch to zoom in/out so I can see fine details of the plant. | 1 |
| R4 | Identify Plant Part | As a student, I want to tap a plant part (e.g., leaf) so a text label appears showing its name. | 2 |
| R5 | Learn About Part | As a student, after tapping a plant part, I want a simple one-sentence function description. | 2 |
| R6 | Clear Information | As a student, I want to tap elsewhere or close so the info pop-up disappears. | 2 |
| R7 | Stable Model | As a student, I want the model to stay locked to the target image without jitter/drift. | 2 |
| R8 | Multiple Plants | As a teacher, I want different target images to trigger different plant models (sunflower, tomato, etc.). | 3 |
| R9 | Teacher Preview Mode | As a teacher, I want to preview models/descriptions so I can plan lessons. | 3 |

---

## 7) Non-Functional Requirements

### NF1: Usability

- Learnable by a child in the target age group within **2 minutes**, without a tutorial.
- Rotation/zoom gestures must be responsive with **<100ms latency**.

### NF2: Performance

- Maintain **>=30 FPS** on supported mid-range devices to ensure smooth AR and reduce motion sickness.

### NF3: Compatibility

- Must run on iOS devices supporting ARKit 4.0+ (iPhone 8 and later).
- Must run on Android devices supporting ARCore 1.0+ (per Google's supported device list).
- **Note for planning:** Sprint 2 is explicitly iOS-only; Android support fits as a **future phase requirement** unless scope changes.

### NF4: Accuracy

- Biological names and descriptions must be **factually accurate** and **age-appropriate**, verified by sponsor (Dr. Ludi).

### NF5: Accessibility

- Text contrast must meet **WCAG 2.0 Level AA** (>=4.5:1 for normal text).
- Core features must be usable without relying on color alone.

### NF6: Maintainability (Sponsor Requirement)

- Codebase must be well-documented (inline comments where helpful).
- Provide a clear **README.md** including:
  - Unity / AR Foundation setup instructions
  - Steps to add/replace 3D models
  - Steps to update biological content **without changing core code**
- Documentation should be structured so future developers (or technically inclined teachers) can extend and maintain the app.

---

## 8) Design Evolution Since Sprint 1 (Current Direction)

- **Platform focus:** Simplified to **iOS-only** for stability/performance (Sprint 2).
- **Model upgrade:** Replaced demo sunflower with a **more realistic 3D model** with detailed textures.
- **UI/UX improvement:** Integrated **login**, **home**, and **QR pages** with child-friendly navigation.
- **Interactivity:** Added **tap-based educational info panels**.
- **Optimization:** Improved AR tracking accuracy and reduced model load time.

---

## 9) Scope Summary (MVP vs Future)

### MVP (based on priorities 1-2)

- Image tracking -> place model -> rotate/zoom -> tap parts -> show name + one-line function -> dismiss panel
- Stable anchoring and smooth performance on supported iOS devices
- Accurate, age-appropriate biology content + maintainable documentation

### Future / Backlog (Priority 3 and beyond)

- Multiple plants via multiple target images
- Teacher preview mode
- Android build (if/when scope expands beyond Sprint 2)
