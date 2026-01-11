/**
 * View Switcher Component
 * 
 * Allows users to manually switch between GLOBAL/LOCAL views.
 * Sets cookie on server to persist preference.
 */

import React, { useState } from 'react';
import { useGeo } from '../../context/GeoContext';
import './ViewSwitcher.css';

const ViewSwitcher = () => {
    const { visitorType } = useGeo();
    const [switching, setSwitching] = useState(false);

    const handleSwitch = async (targetView) => {
        if (switching) return;

        setSwitching(true);

        try {
            // Call server endpoint to set cookie
            // In local dev, this might need an absolute URL or proxy setup
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/set-view/${targetView}/`, {
                method: 'GET',
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                // Redirect to appropriate homepage
                const targetUrl = targetView === 'GLOBAL' ? '/en/' : '/tr/';
                window.location.href = targetUrl;
            } else {
                // Fallback if the endpoint is not ready or fails
                const targetUrl = targetView === 'GLOBAL' ? '/en/' : '/tr/';
                window.location.href = targetUrl;
            }
        } catch (error) {
            console.error('Failed to switch view:', error);
            // Fallback
            const targetUrl = targetView === 'GLOBAL' ? '/en/' : '/tr/';
            window.location.href = targetUrl;
            setSwitching(false);
        }
    };

    return (
        <div className="view-switcher">
            <button
                className={`view-option ${visitorType === 'GLOBAL' ? 'active' : ''}`}
                onClick={() => handleSwitch('GLOBAL')}
                disabled={switching || visitorType === 'GLOBAL'}
                aria-label="Switch to Global View (English)"
            >
                <span className="flag-icon">🌍</span>
                <span className="view-label">Global / EN</span>
            </button>

            <button
                className={`view-option ${visitorType === 'LOCAL' ? 'active' : ''}`}
                onClick={() => handleSwitch('LOCAL')}
                disabled={switching || visitorType === 'LOCAL'}
                aria-label="Switch to Local View (Turkish)"
            >
                <span className="flag-icon">🇹🇷</span>
                <span className="view-label">Türkiye / TR</span>
            </button>
        </div>
    );
};

export default ViewSwitcher;
