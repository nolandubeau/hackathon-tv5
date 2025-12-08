'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '@/lib/discovery-store';

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [gradientColor, setGradientColor] = useState('#4ECDC4');
  const [isLoading, setIsLoading] = useState(true);
  const { setUserName, profileComplete } = useDiscoveryStore();

  // Redirect to home if profile is already complete
  useEffect(() => {
    if (profileComplete) {
      router.push('/');
    }
  }, [profileComplete, router]);

  // Fetch background image based on preferences
  useEffect(() => {
    const fetchBackground = async () => {
      try {
        // For now, use a guest user or random image
        // In a real app, you'd get userId from auth context
        const response = await fetch('/api/background-image');
        const data = await response.json();

        if (data.success) {
          setBackgroundImage(data.imageUrl);
          setGradientColor(data.color);
        }
      } catch (error) {
        console.error('Error fetching background:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackground();
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      router.push('/discover');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-start px-8 md:px-16 lg:px-24 relative z-10">
        <div className="w-full max-w-[500px]">
          <h1 className="headline-hero mb-4 text-text-primary">
            Discover Your<br />Next Watch
          </h1>
          <p className="text-body mb-8 text-text-secondary">
            No questionnaires. No endless scrolling.<br />
            Just a few moments of your attention.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field w-full rounded-lg"
              placeholder="What's your name?"
              autoFocus
            />

            <button
              className="btn-primary w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!name.trim()}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Full screen background with gradient overlay */}
      <div className="hidden md:block md:w-1/2 fixed right-0 top-0 h-screen">
        {isLoading ? (
          <div className="w-full h-full bg-bg-elevated animate-pulse" />
        ) : (
          <>
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImage})`,
              }}
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${gradientColor}15 0%, ${gradientColor}40 50%, ${gradientColor}60 100%)`,
                backdropFilter: 'blur(2px)',
              }}
            />

            {/* Darker overlay for better contrast */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-transparent"
            />
          </>
        )}
      </div>

      {/* Mobile background - full screen behind content */}
      <div className="md:hidden fixed inset-0 z-0">
        {!isLoading && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImage})`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${gradientColor}20 0%, ${gradientColor}50 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" />
          </>
        )}
      </div>
    </main>
  );
}
