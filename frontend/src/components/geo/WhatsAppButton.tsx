/**
 * WhatsApp Button Component
 * 
 * Floating WhatsApp button (TR IP + Mobile only).
 * Pre-filled message in Turkish.
 */

import React, { useState, useEffect } from 'react';
import { useGeo } from '../../context/GeoContext';
import './WhatsAppButton.css';

const WhatsAppButton: React.FC = () => {
    const { isLocal } = useGeo();
    const [isMobile, setIsMobile] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Show button after 2 seconds (with animation)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Only show for LOCAL visitors on mobile
    if (!isLocal || !isMobile) {
        return null;
    }

    const phoneNumber = '905XXXXXXXXX'; // Replace with actual number
    const message = encodeURIComponent(
        'Merhaba LOXTR, ürünleriniz hakkında bilgi almak istiyorum.'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`whatsapp-button ${isVisible ? 'visible' : ''}`}
            aria-label="WhatsApp ile iletişime geç"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
        </a>
    );
};

export default WhatsAppButton;
