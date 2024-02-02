import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext();

// Define useUser hook for easy consumption of context
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    // UserProvider implementation
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

    useEffect(() => {
        // Add effect for localStorage if needed
    }, []);

    const updateUserId = (id) => {
        localStorage.setItem('userId', id);
        setUserId(id);
    };

    const clearUserId = () => {
        localStorage.removeItem('userId');
        setUserId(null);
    };

    return (
        <UserContext.Provider value={{ userId, updateUserId, clearUserId }}>
            {children}
        </UserContext.Provider>
    );
};
