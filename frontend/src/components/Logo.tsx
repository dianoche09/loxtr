import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'default' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
    return (
        <div className={`select-none ${className}`}>
            <img
                src="/images/logo-full.png"
                alt="LOXTR - Locate • Obtain • Xport"
                className="h-12 w-auto"
            />
        </div>
    );
};

export default Logo;
