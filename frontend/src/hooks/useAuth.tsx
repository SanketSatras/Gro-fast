import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export type UserRole = "customer" | "vendor" | "admin" | "delivery";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    addresses?: Array<{ id: string; label: string; address: string; pincode: string; isDefault?: boolean }>;
    preferences?: { orderUpdates: boolean; promotions: boolean };
}

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    login: (userData: User) => void;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem("grofast-user");
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Failed to parse saved user", e);
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Since we initialize from localStorage synchronously, 
        // we can set isLoading to false immediately in useEffect.
        // This effect can also be used for any asynchronous hydration if needed in the future.
        setIsLoading(false);
    }, []);

    const login = async (userData: User) => {
        setUser(userData);
        localStorage.setItem("grofast-user", JSON.stringify(userData));
        if ((userData as any).token) {
            localStorage.setItem("grofast-token", (userData as any).token);
        }
    };

    const logout = async () => {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error("Logout API call failed", e);
        }
        setUser(null);
        localStorage.removeItem("grofast-user");
        localStorage.removeItem("grofast-token");
    };

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("grofast-user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role || null,
                login,
                logout,
                updateProfile,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
