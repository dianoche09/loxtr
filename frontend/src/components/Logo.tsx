import React from 'react';

export interface LogoProps {
    className?: string;
    variant?: 'default' | 'white';
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size }) => {
    const heightStyle = size ? { height: `${size}px` } : {};
    return (
        <div className={`select-none ${className}`}>
            <img
                src="/images/logo-full.png"
                alt="LOXTR - Locate • Obtain • Xport"
                className="h-12 w-auto"
                style={heightStyle}
            />
        </div>
    );
};

export default Logo;
