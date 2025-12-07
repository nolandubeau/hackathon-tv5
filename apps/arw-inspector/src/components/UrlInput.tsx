import { useState } from 'react';
import './UrlInput.css';

interface UrlInputProps {
  onInspect: (url: string) => void;
  disabled?: boolean;
}

export function UrlInput({ onInspect, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInspect(url.trim());
    }
  };

  return (
    <form className="url-input-form" onSubmit={handleSubmit}>
      <div className="url-input-wrapper">
        <input
          type="text"
          className="url-input"
          placeholder="Enter URL to inspect (e.g., http://localhost:3000)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
        />
        <button type="submit" className="inspect-button" disabled={disabled || !url.trim()}>
          Inspect
        </button>
      </div>
    </form>
  );
}
