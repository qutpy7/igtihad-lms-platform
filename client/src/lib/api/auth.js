// Authentication is now fully handled by AuthContext and apiClient.
// This file is kept only for backward compatibility if any old components import from it directly.

export const loginWithEmail = async (email, password) => {
    throw new Error('Please use signIn from useAuth hook');
}

export const signUpWithEmail = async (email, password, metadata) => {
    throw new Error('Please use signUp from useAuth hook');
}

export const signOut = async () => {
    throw new Error('Please use signOut from useAuth hook');
}
