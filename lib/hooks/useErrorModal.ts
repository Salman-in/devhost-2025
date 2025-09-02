import { useState } from 'react';

interface UseErrorModalProps {
  defaultTitle?: string;
  defaultType?: 'error' | 'warning' | 'info';
}

export function useErrorModal({ defaultTitle, defaultType = 'error' }: UseErrorModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState(defaultTitle);
  const [type, setType] = useState<'error' | 'warning' | 'info'>(defaultType);

  const showError = (errorMessage: string, errorTitle?: string, errorType: 'error' | 'warning' | 'info' = 'error') => {
    setMessage(errorMessage);
    setTitle(errorTitle || defaultTitle);
    setType(errorType);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    message,
    title,
    type,
    showError,
    hideError
  };
}
