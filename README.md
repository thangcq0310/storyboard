# Storyboard-to-Video Automation

Premium AI creative generator for turning a video idea into storyboard prompts, Seedance motion prompts, shotlists, and export-ready workflow documents.

The app is designed as a simple workflow-first cinematic generator rather than a generic admin dashboard.

## Features

- Workflow-first layout: choose workflow, enter idea, configure prompts, generate output
- Four supported storyboard workflows only
- Storyboard preview with the correct panel count for each workflow
- Segmented prompt output cards for system, style, camera, motion, negative, and Seedance prompts
- Shotlist and Seedance prompt generation toggles
- Export options for Markdown workflow, JSON, prompt pack, and print-ready production brief
- Optional advanced section for reasoning, render safety, workflow pipeline, and prompt architecture

## Supported Workflow Cases

The app only supports these storyboard-to-video workflow patterns:

- **Case 1: Standard Storyboard -> Video**  
  A balanced 6-panel linear storyboard workflow for general narrative videos.

- **Case 2: 3x3 Grid Storyboard**  
  A 9-panel grid workflow for parallel exploration and visual structure.

- **Case 10: Multi-Frame Fast-Cut**  
  A 12-frame montage workflow for high-energy sequences and rapid pacing.

- **Case 19: Storyboard-First Cost Control**  
  An 8-panel editorial workflow optimized for fewer render passes and lower cost.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Multi-provider API integration with Replicate and custom compatible APIs

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

Open **Settings** inside the app and choose providers/models for image and video generation.

Built-in provider options:

- **Replicate**: uses the Replicate predictions API.
- **Custom API**: uses a Replicate-compatible API gateway or proxy. The endpoint must support:
  - `GET /predictions?limit=1`
  - `POST /predictions`
  - `GET /predictions/:id`

For Custom API, set the base URL in Settings, for example:

```text
https://your-api.example.com/v1
```

Provider keys and model selections are stored locally in the browser using `localStorage`.

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
