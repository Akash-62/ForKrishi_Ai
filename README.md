<div align="center">
<img width="1200" height="475" alt="ForKrishi AI Banner" src="./public/logo_banner.png" />

# 🌱 ForKrishi AI (ForKisan)
### *Voice-First · India-First · AI-Powered Crop Help Assistant*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-3.5%20Flash-green?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---
</div>

**ForKrishi AI** is a lightweight, mobile-first web app designed for Indian farmers. It simplifies crop disease diagnosis through voice and visual AI inputs, completely localized into native languages (**English, Kannada, and Hindi**).

## ✨ Key Features

*   **🎙️ Voice-First Diagnosis**: Farmers speak crop problems in local languages; Gemini AI transcribes, processes, and diagnoses instantly.
*   **📸 Visual Photo Scanner**: Real-time leaf lesion detection with bounding-box analysis and confidence rating.
*   **🌿 Organic vs. Chemical Advisories**: Split treatment plans featuring a strict *Pesticide Safety Precautions* warning card.
*   **📲 WhatsApp Share Card Engine**: Generates and downloads custom-branded PNG cards on the fly using HTML5 Canvas.
*   **💰 Voice-Query Mandi Prices**: Interactive market boards with voice-search and voice-readout price trends.
*   **📶 Saved Offline Database**: Fully cached localStorage advisor profiles for connectivity-free field access.
*   **🗺️ Expert Support**: Direct local Krishi Vigyan Kendra (KVK) finder to call or navigate to local extension officers.

## 📸 Results & Screenshots

Here are the latest results and interface screenshots showing the premium localized features, scan overlays, and advisory cards:

| Home Screen | Crop Detector & Cancel Button |
| --- | --- |
| ![ForKisan AI Home Screen](./public/results/forkisan_homescreen.png) | ![Crop Detector Scanner](./public/results/crop_detector_cancel_button.png) |

| Localized Language Selection | Kannada Crop Advisory Card |
| --- | --- |
| ![Localized Language Selection](./public/results/language_modal_localized.png) | ![Kannada Crop Advisory Card](./public/results/mango_advisory_card_result.png) |

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15, React 19, TailwindCSS, Framer Motion (`motion/react`)
*   **AI Integration**: Google GenAI SDK (`@google/genai`), Gemini 3.5 Flash Model
*   **Web API**: HTML5 Canvas, Web Speech Synthesis & Speech Recognition API
*   **Caching**: LocalStorage Offline Cache + Service Worker

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   NPM

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Akash-62/ForKrishi_Ai.git
   cd ForKrishi_Ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   Open [https://for-krishi-ai.vercel.app/](https://for-krishi-ai.vercel.app/) to view the app!
