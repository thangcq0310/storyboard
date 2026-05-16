# Storyboard-to-Video Automation

Premium AI creative production tool for turning a video idea into storyboard panels, image prompts, motion prompts, and export-ready production documents.

The app is designed as an AI cinematic workflow system rather than a generic admin dashboard. It focuses on storyboard generation, prompt architecture, render safety analysis, and AI video workflow planning.

## Features

- Compact cinematic workspace for creative video planning
- Storyboard grid preview with active sequence selection
- AI selected workflow analysis with match, coherence, render stability, and cost efficiency
- Prompt architecture visibility for cinematic style, camera direction, subject consistency, motion guidance, and lighting control
- Render safety analysis for character consistency, motion complexity, frame drift risk, continuity, and Seedance compatibility
- Segmented prompt output cards for system, style, camera, motion, negative, and Seedance prompts
- Export options for Markdown workflow, JSON, prompt pack, and print-ready production brief
- Creator Mode and Production Mode workspace switch
- Batch mode, analytics, and saved recent workflows

## Supported Workflow Cases

The app only supports these storyboard-to-video workflow patterns:

- **Case 1: Standard Storyboard -> Video**  
  A balanced 6-panel linear storyboard workflow for general narrative videos.

- **Case 2: 3x3 Grid Storyboard**  
  A 9-panel grid workflow for parallel exploration and visual structure.

- **Case 10: Multi-Frame Fast-Cut**  
  A 12-frame montage workflow for high-energy sequences and rapid pacing.

- **Case 19: Storyboard-First Cost Control**  
  A 4-panel editorial workflow optimized for fewer render passes and lower cost.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Replicate REST API integration

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

By default, Vite runs on:

```text
http://localhost:5175
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Configuration

Open **Settings** inside the app and add a Replicate API key.

The key is stored locally in the browser using `localStorage`.

During local development, Replicate requests are proxied through Vite:

```text
/api/replicate/v1 -> https://api.replicate.com/v1
```

This avoids browser CORS issues when running `npm run dev`. For production deployments, configure a backend or hosting proxy for the same route, or provide `VITE_REPLICATE_API_BASE` with a same-origin API proxy URL.

## Project Structure

```text
src/
  App.tsx
  components/
    StoryboardPreview.tsx
    CaseTemplateCard.tsx
    WorkflowPipeline.tsx
    AIReasoningPanel.tsx
    RenderSafetyPanel.tsx
    PromptArchitecturePanel.tsx
    PromptOutputPanel.tsx
    ExportPanel.tsx
  lib/
    api.ts
    caseRouter.ts
    promptBuilder.ts
    safetyAnalyzer.ts
    workflowCases.ts
  prompts/
    seedancePrompts.ts
  types/
    index.ts
```

## Notes

- The UI redesign keeps the existing workflow engine and business logic intact.
- Storyboard is the primary output surface.
- Video generation requires configured API access.
