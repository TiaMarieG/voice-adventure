import { useState, useEffect, useRef } from 'react';

/**
 * useTypewriter
 *
 * Reveals `text` one character at a time at `speed` ms per character.
 *
 * Returns:
 *   displayText  — the partially (or fully) revealed string
 *   isTyping     — true while characters are still being revealed
 *   skip         — function that instantly reveals the full text
 */
export function useTypewriter(text, speed = 28, onComplete) {
   const [displayText, setDisplayText] = useState('');
   const [isTyping, setIsTyping] = useState(false);
   const indexRef = useRef(0);
   const timerRef = useRef(null);
   const textRef = useRef(text);

   useEffect(() => {
      textRef.current = text;
   }, [text]);

   useEffect(() => {
      if (!text) {
         setDisplayText('');
         setIsTyping(false);
         return;
      }

      clearInterval(timerRef.current);
      indexRef.current = 0;
      setDisplayText('');
      setIsTyping(true);

      timerRef.current = setInterval(() => {
         if (indexRef.current < textRef.current.length) {
            setDisplayText(textRef.current.slice(0, indexRef.current + 1));
            indexRef.current += 1;
         } else {
            clearInterval(timerRef.current);
            setIsTyping(false);
            onComplete?.();
         }
      }, speed);

      return () => clearInterval(timerRef.current);
   }, [text, speed]);

   const skip = () => {
      clearInterval(timerRef.current);
      indexRef.current = text?.length ?? 0;
      setDisplayText(text ?? '');
      setIsTyping(false);
      onComplete?.();
   };

   return { displayText, isTyping, skip };
}