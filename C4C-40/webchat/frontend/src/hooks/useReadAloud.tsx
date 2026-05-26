import { useState, useRef } from 'react';

export const useReadAloud = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const readAloud = async (text: string, langCode: string) => {
    // Stop if already playing
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);

      const res = await fetch(
        'https://kaarigarconnect-production.up.railway.app/api/v1/automate/tts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang_code: langCode }),
        }
      );

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      audio.play();
    } catch (e) {
      setIsPlaying(false);
    }
  };

  return { readAloud, isPlaying };
};