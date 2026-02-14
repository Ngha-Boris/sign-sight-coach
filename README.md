# ✋ Sign-Sight — AI Sign Language Coach

> Learn sign language with real-time AI feedback through your webcam.

Sign-Sight is an interactive educational web app that teaches sign language gestures using real-time computer vision. Users practice hand signs and receive instant corrective feedback, transforming sign learning into a gamified, accessible experience.

Built for social impact and inclusive communication.

---

## 🌍 Overview

Learning sign language without a teacher is difficult because beginners lack immediate feedback. Sign-Sight solves this by turning your webcam into an AI gesture coach.

The system tracks hand landmarks in real time, evaluates gesture accuracy, and provides actionable feedback like:

- ✅ “Perfect!”
- ⚠ “Tilt your thumb inward”
- 🔄 “Straighten your fingers”

This enables self-guided, confidence-building practice — anytime, anywhere.

---

## ✨ Core Features

### 🎯 Live Learning Mode
- Guided gesture demonstrations
- Real-time hand tracking
- Instant corrective feedback
- Confidence scoring meter

---

### 🎮 Practice Mode
- Random sign challenges
- Timed practice rounds
- Accuracy scoring
- Session summary

---

### 🧠 Gesture Evaluation Engine
- Hand landmark detection
- Gesture similarity scoring
- Threshold-based accuracy checks
- Instructional feedback generation

---

### 🔊 Voice Interaction
- Text-to-speech coaching feedback
- Optional speech recognition controls

---

### 🏆 Gamification
- Score tracking
- Combo streaks
- Performance summaries

---

### ♿ Accessibility Enhancements
- Visual gesture hints
- Slow demonstration mode
- High-contrast UI options

---

## 🧠 How It Works

1. Webcam captures live hand movement.
2. Hand landmarks are detected in real time.
3. Landmarks are compared against gesture templates.
4. A similarity score determines accuracy.
5. Feedback is displayed instantly.

Gesture similarity model:

$$
Similarity = 1 - \frac{\sum |L_{user} - L_{template}|}{n}
$$

Where:

- \(L_{user}\) → detected landmarks  
- \(L_{template}\) → reference gesture  
- \(n\) → total comparisons  

This approach enables fast, browser-native gesture evaluation.

---

## 🏗 Architecture Overview

```
User Webcam
     ↓
Hand Landmark Detection
     ↓
Gesture Comparison Engine
     ↓
Feedback + Scoring System
     ↓
UI Rendering + Voice Feedback
```

Key design principles:

- Client-side gesture processing for low latency
- Modular architecture for scalability
- Responsive UI rendering pipeline

---

## 🛠 Tech Stack

### Frontend
- TypeScript
- React + Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router
- TanStack React Query

### Computer Vision
- Browser-based hand landmark tracking
- GPU/WebAssembly acceleration

### AI Interaction
- Text-to-speech integration
- Speech recognition (browser-native)

### Backend & Cloud
- Edge Functions runtime
- PostgreSQL database
- Cloud deployment infrastructure

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sign-sight.git
cd sign-sight
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Run development server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file if required:

```env
TTS_API_KEY=your_key_here
```

---

## ▶ Demo

Live demo:

👉 https://your-demo-link.com

Video walkthrough:

👉 https://your-video-link.com

---

## 📦 Project Structure

```
src/
 ├── components/
 ├── vision/
 ├── feedback/
 ├── hooks/
 ├── pages/
 └── utils/
```

- `vision/` → gesture tracking logic  
- `feedback/` → evaluation engine  
- `components/` → UI modules  

---

## 🧪 Performance Goals

- Smooth real-time tracking (~30 FPS)
- Low-latency feedback
- Browser-optimized rendering

---

## 🌱 Future Roadmap

- Full sign alphabet training
- Word and phrase recognition
- Personalized learning profiles
- AI classifier training
- Multiplayer practice modes
- Mobile optimization

---

## 🎯 Impact

Sign-Sight promotes:

- Inclusive communication
- Accessibility learning
- Confidence-building education

The goal is to make sign language learning approachable, interactive, and widely accessible.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License — free to use and modify.

---

## 💡 Acknowledgments

Inspired by inclusive education, accessibility advocacy, and the power of real-time AI learning tools.

---

## ⭐ Support

If you like this project:

👉 Star the repo  
👉 Share it  
👉 Contribute  

Together we make communication more inclusive.
