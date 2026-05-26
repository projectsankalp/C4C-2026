/**
 * Re-export of the transcription service so flow files don't reach across the
 * services boundary directly. Slim wrapper so we can attach engine-specific
 * defaults if needed in the future.
 */
export { transcribeAudio } from "../../services/transcribeService";
