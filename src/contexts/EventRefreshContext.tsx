import React, { createContext, useContext, useState, useCallback } from 'react';

interface EventRefreshContextType {
    refreshTrigger: number;
    triggerRefresh: () => void;
}

const EventRefreshContext = createContext<EventRefreshContextType | undefined>(undefined);

export const useEventRefresh = () => {
    const context = useContext(EventRefreshContext);
    if (!context) {
        throw new Error('useEventRefresh must be used within an EventRefreshProvider');
    }
    return context;
};

interface EventRefreshProviderProps {
    children: React.ReactNode;
}

export const EventRefreshProvider: React.FC<EventRefreshProviderProps> = ({ children }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <EventRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
            {children}
        </EventRefreshContext.Provider>
    );
};
