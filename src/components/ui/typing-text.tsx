'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface TypingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  markdown?: boolean;
  rehypePlugins?: any[];
  onComplete?: () => void;
  markdownComponents?: any;
}

/**
 * Displays text with a typing animation effect.
 * Supports both plain text and markdown rendering.
 */
export function TypingText({
  text,
  speed = 15, // Default 15ms per character (adjust for speed)
  className = '',
  markdown = false,
  rehypePlugins,
  onComplete,
  markdownComponents,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  // Reset when text changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset state
    isActiveRef.current = false;
    setDisplayedText('');

    if (!text || text.length === 0) {
      return;
    }

    // Start typing animation
    isActiveRef.current = true;
    let currentIndex = 0;

    const typeNextChar = () => {
      // Check if we're still active (component might have unmounted or text changed)
      if (!isActiveRef.current) {
        return;
      }

      if (currentIndex < text.length) {
        const newText = text.slice(0, currentIndex + 1);
        setDisplayedText(newText);
        currentIndex++;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Start typing immediately
    typeNextChar();

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, speed, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render anything if there's no text
  if (!text || text.length === 0) {
    return null;
  }

  if (markdown) {
    // Use custom components (without cursor)
    const componentsWithCursor = markdownComponents ? {
      ...markdownComponents,
      p: ({ children, ...props }: any) => {
        const OriginalP = markdownComponents.p || (({ children }: any) => <p className="mb-3 last:mb-0 break-words">{children}</p>);
        return <OriginalP {...props}>{children}</OriginalP>;
      },
    } : {
      p: ({ children, ...props }: any) => (
        <p className="mb-3 last:mb-0 break-words" {...props}>{children}</p>
      ),
    };

    return (
      <div className={className}>
        {displayedText && (
          <ReactMarkdown
            rehypePlugins={rehypePlugins}
            components={componentsWithCursor}
          >
            {displayedText}
          </ReactMarkdown>
        )}
      </div>
    );
  }

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
}
