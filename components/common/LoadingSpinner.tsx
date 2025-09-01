import React from 'react';

interface LoadingSpinnerProps {
    isPrimary?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isPrimary = false }) => {
    const borderColor = isPrimary ? 'border-primary' : 'border-white';
    return (
        <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${borderColor}`}></div>
    );
};

export default LoadingSpinner;