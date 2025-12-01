import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check for saved session on load
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedAdmin = localStorage.getItem('isAdmin');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        if (savedAdmin === 'true') {
            setIsAdmin(true);
        }
    }, []);

    const login = (email, password, adminMode = false) => {
        console.log("Login called with:", email, adminMode);
        // Mock Login Logic
        // In a real app, this would call the backend
        const newUser = { email, id: '123' };
        setUser(newUser);
        setIsAdmin(adminMode);

        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('isAdmin', adminMode);
        console.log("User set to:", newUser);
        return true;
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
