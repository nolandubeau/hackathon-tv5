'use client';

import { useState } from 'react';
import { Video } from '@/lib/tmdb';

interface VideoPlayerProps {
  videos: Video[];
  initialIndex?: number;
  onClose: () => void;
}

export function VideoPlayer({ videos, initialIndex = 0, onClose }: VideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (videos.length === 0) return null;

  const currentVideo = videos[currentIndex];
  const hasMultiple = videos.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasMultiple) handlePrevious();
    if (e.key === 'ArrowRight' && hasMultiple) handleNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <div
        className="relative w-full max-w-6xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close video player"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video info */}
        <div className="mb-4 text-white">
          <h3 className="text-xl font-semibold">{currentVideo.name}</h3>
          <p className="text-sm text-gray-300">
            {currentVideo.type}
            {hasMultiple && ` • ${currentIndex + 1} of ${videos.length}`}
          </p>
        </div>

        {/* Video container */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            key={currentVideo.key}
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${currentVideo.key}?autoplay=1&rel=0`}
            title={currentVideo.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white hover:text-gray-300 transition-colors"
              aria-label="Previous video"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white hover:text-gray-300 transition-colors"
              aria-label="Next video"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Video thumbnails */}
        {hasMultiple && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {videos.map((video, index) => (
              <button
                key={video.key}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 relative group ${
                  index === currentIndex ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                  alt={video.name}
                  className="w-40 h-24 object-cover rounded"
                />
                {index !== currentIndex && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded group-hover:bg-black/20 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <p className="text-xs text-white truncate">{video.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
