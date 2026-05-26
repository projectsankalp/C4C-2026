# MindMitra - Mental Health Access Platform

The goal of this project is to build a full-stack mental health web application that tackles the accessibility deficit in India. It will provide multilingual emotional support, anonymous interactions, community outreach resources, and early identification tools to overcome social stigma and infrastructural barriers.

## User Review Required

> [!IMPORTANT]
> Based on your request, I have updated the stack to use **Python FastAPI** instead of Next.js for the backend.
> Since this application involves handling sensitive emotional health data, ensuring privacy and anonymity from the ground up is critical. We will prioritize an architecture that minimizes data collection and allows full functionality without requiring Personally Identifiable Information (PII).

## Open Questions

> [!WARNING]
> Please review and provide feedback on the following technical decisions for the new stack:
> 1. **Frontend**: I propose using React (via Vite) with Vanilla CSS / CSS Modules to create a premium, custom design that integrates well with the FastAPI backend. Does this sound good?
> 2. **Database Engine**: We will use **Supabase** (PostgreSQL) instead of MongoDB. I will configure the FastAPI backend to interact with Supabase using the official `supabase-py` client or SQLAlchemy. Do you already have a Supabase project set up?
> 3. **AI Chatbot**: We will need an LLM API (like Google Gemini) to power the multilingual emotional wellness assistant. Do you have an API key ready for the provider you prefer?
> 4. **Languages**: Which specific Indian languages (e.g., Hindi, Tamil, Bengali) should be prioritized for the MVP alongside English?

## Proposed Architecture & Changes

### Technology Stack
- **Backend Framework**: Python FastAPI for high-performance, asynchronous API routes.
- **Frontend Framework**: React (via Vite) for a snappy single-page application experience.
- **Styling**: Vanilla CSS with modern aesthetics (glassmorphism, dark/light modes, micro-animations).
- **Database**: Supabase (PostgreSQL), utilizing the Supabase Python client for backend interactions and row-level security where applicable.
- **Authentication**: JWT-based authentication focusing on anonymous guest sessions and secure, non-identifying account creation.
- **AI Integration**: Python SDK integration with an LLM for multilingual support on the backend.

### Feature Rollout (Phase 1 MVP)

#### 1. Multilingual Emotional Wellness Assistant
- Real-time anonymous chat interface on the frontend.
- FastAPI WebSocket or REST endpoint to stream LLM responses.
- LLM prompt engineering to act as an empathetic listener in multiple languages.

#### 2. Early Identification & Assessments
- Interactive self-assessment quizzes (e.g., based on PHQ-9, GAD-7) to help users understand their emotional state.
- Automated resource recommendations based on assessment results.

#### 3. Community Outreach & Resource Hub
- A directory of verified national and state-level helplines.
- Educational articles and debunking of mental health myths to combat social stigma.

#### 4. Anonymous User Profiles
- Ability to save progress, journal entries, and chat history using a securely generated JWT token (no phone number or real name required).

## Verification Plan

### Automated Tests
- Unit testing for FastAPI routes handling assessments and chatbot logic using `pytest`.

### Manual Verification
- Testing the React UI/UX across desktop and mobile devices to ensure a premium feel.
- Verifying the chatbot's multilingual responses and tone appropriateness.
- Validating the anonymity of database entries.
