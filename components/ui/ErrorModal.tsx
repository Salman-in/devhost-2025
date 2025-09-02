'use client';

import { useEffect } from 'react';
import { Button } from './button';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'error' 
}: ErrorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          defaultTitle: 'Warning'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          defaultTitle: 'Information'
        };
      default: // error
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          defaultTitle: 'Error'
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${config.bgColor} ${config.borderColor} border-2 transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center space-x-3">
            <AlertCircle className={`h-6 w-6 ${config.iconColor}`} />
            <h3 className={`text-lg font-semibold ${config.titleColor}`}>
              {title || config.defaultTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <Button 
              onClick={onClose}
              variant="outline"
              className="px-4 py-2"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
