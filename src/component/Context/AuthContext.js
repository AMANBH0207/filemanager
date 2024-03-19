import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../fireBase'; // Import Firebase authentication module
import {signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut } from 'firebase/auth';
// Create the authentication context
const AuthContext = createContext();

// Custom hook to access the authentication context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to provide authentication state and methods
 const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to sign up a new user
    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth,email, password);
    };

    // Function to sign in an existing user
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Function to sign out the current user
    const signOut = () => {
        return signOut(auth).then(()=>{
            console.log("User signed out!");
        });
    };

    useEffect(() => {
        // Set up an observer for user authentication state changes
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Clean up the observer when component unmounts
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signUp,
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
export default AuthProvider;
