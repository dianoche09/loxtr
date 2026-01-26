
import { useState, useCallback, useRef } from 'react';
import { aiAPI } from '../services/api';

function debounce(fn: Function, ms: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
}

export function useAISuggestions() {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any>(null);

    const fetchSuggestions = useCallback(
        debounce(async (context: 'industry' | 'market' | 'buyer_profile', query: string, extra: any = {}) => {
            if (!query || query.length < 2) {
                setSuggestions(null);
                return;
            }

            setLoading(true);
            try {
                const res = (await aiAPI.suggest({ context, query, ...extra })) as any;
                if (res.success) {
                    setSuggestions(res.data);
                }
            } catch (error) {
                console.error('AI Suggestion Error:', error);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    return {
        loading,
        suggestions,
        fetchSuggestions,
        setSuggestions
    };
}
