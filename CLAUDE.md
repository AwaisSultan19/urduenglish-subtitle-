## Key Functions

1. **uploadVideoDirect(file, callback)**:
   - Handles client-side video upload
   - Returns video URL on success
   - Updates upload progress status
   - Manages upload state transitions

2. **transcribeAudio(videoUrl, fileName)**:
   - Downloads video from URL
   - Extracts audio and processes with Groq Whisper API
   - Splits transcript into segments with calculated timing
   - Returns caption segments with precise timing

3. **translateSegments(segments, targetLanguage)**:
   - Batch translates caption text using Google Translate API
   - Handles special case for Urdu (no translation needed)
   - Maps language codes appropriately
   - Returns updated segments with translatedText field

4. **generateSrt(segments, useTranslated)**:
   - Converts caption segments to SRT format
   - Formats timestamps properly
   - Optionally applies translated text
   - Returns formatted SRT string

5. **burnSubtitlesIntoVideo(videoUrl, segments, style)**:
   - Downloads video and creates temporary files
   - Generates SRT from segments
   - Uses FFmpeg to burn captions into video
   - Handles color styling and positioning
   - Returns video buffer for download

6. **exportSubtitles(segments, format)**:
   - Either generates SRT file or processes video with burned captions
   - Returns appropriate response for download

## Development Workflow

### Common Commands

1. **Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Lint**:
   ```bash
   npm run lint
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

5. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
   - `GROQ_API_KEY` - Required for transcription processing
   - `SUPPORTED_AUDIO_EXTENSIONS` - Defines supported audio formats
   - `MAX_FILE_SIZE_MB` - Maximum upload size limit

## Notes for New Developers

- All API routes handle JSON input/output and appropriate error responses
- Error handling follows consistent pattern: { success: false, error: "message" }
- Status transitions follow: "idle" → "uploading" → "transcribing" → "translating" → "ready"
- Memorialize important state variables:
  - `status`: Current application state
  - `segments`: Processed caption segments
  - `isProcessing`: Whether a background operation is active
- All components are optimized for progressive enhancement:
  - Upload progress visualization
  - Real-time status updates
  - Cancellable operations
  - Error boundaries

## Testing Considerations

- Test cases should verify:
  - Successful upload and processing pipeline
  - Translation accuracy for target languages
  - FFmpeg caption rendering quality
  - Error handling and edge cases
  - State management transitions

## Other Relevant Files

- `.env` - Local environment configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Scripts and dependencies
- `Readme.md` - User-facing documentation