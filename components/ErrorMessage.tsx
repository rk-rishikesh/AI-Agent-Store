import React from 'react';

// Define error types for better error handling
export type ErrorType = 'upload' | 'template' | 'generation' | 'network' | 'generic';

export interface ErrorState {
    message: string;
    type: ErrorType;
    suggestions?: string[];
    retry?: boolean;
}

interface ErrorMessageProps {
    error: ErrorState;
    onRetry?: () => void;
    onDismiss: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry, onDismiss }) => {
    const getErrorIcon = () => {
        switch (error.type) {
            case 'upload':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'network':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getBackgroundColor = () => {
        switch (error.type) {
            case 'upload':
                return 'bg-amber-50 border-amber-200';
            case 'network':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-red-50 border-red-200';
        }
    };

    const getTextColor = () => {
        switch (error.type) {
            case 'upload':
                return 'text-amber-800';
            case 'network':
                return 'text-red-800';
            default:
                return 'text-red-800';
        }
    };

    return (
        <div className={`w-full max-w-md rounded-lg border p-4 ${getBackgroundColor()}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                    {getErrorIcon()}
                </div>
                <div className="ml-3 w-full">
                    <h3 className={`text-sm font-medium ${getTextColor()}`}>
                        {error.type === 'upload' ? 'Image Upload Issue' :
                            error.type === 'template' ? 'Template Selection Issue' :
                                error.type === 'network' ? 'Connection Problem' :
                                    error.type === 'generation' ? 'Generation Failed' : 'Error'}
                    </h3>
                    <div className={`mt-2 text-sm ${getTextColor()}`}>
                        <p>{error.message}</p>
                        {error.suggestions && error.suggestions.length > 0 && (
                            <ul className="mt-1 list-disc list-inside">
                                {error.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                        {error.retry && onRetry && (
                            <button
                                type="button"
                                className={`rounded-md px-3 py-1.5 text-sm font-medium ${error.type === 'upload' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                        'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                onClick={onRetry}
                            >
                                Try Again
                            </button>
                        )}
                        <button
                            type="button"
                            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200"
                            onClick={onDismiss}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-200 inline-flex"
                    onClick={onDismiss}
                >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ErrorMessage; 
