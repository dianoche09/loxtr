import React, { useEffect, useState, useRef } from 'react';
import { useInView, useSpring, useTransform } from 'framer-motion';

interface CounterProps {
    value: string;
    label: string;
}

const Counter: React.FC<CounterProps> = ({ value, label }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Parse numeric value (e.g., "15+" -> 15, "$120M" -> 120)
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const suffix = value.replace(/[0-9]/g, '');

    const count = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: 2000
    });

    const rounded = useTransform(count, (latest) => Math.floor(latest));
    const [displayValue, setDisplayValue] = useState("0");

    useEffect(() => {
        if (isInView) {
            count.set(numericValue);
        }
    }, [isInView, numericValue, count]);

    useEffect(() => {
        return rounded.on("change", (latest) => {
            setDisplayValue(latest.toString());
        });
    }, [rounded]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-6xl font-heading font-extrabold text-white mb-3 flex items-center justify-center">
                <span>{displayValue}</span>
                <span className="text-yellow text-4xl ml-1">{suffix}</span>
            </div>
            <div className="text-white/40 uppercase tracking-widest text-xs font-bold">{label}</div>
        </div>
    );
};

export default Counter;
