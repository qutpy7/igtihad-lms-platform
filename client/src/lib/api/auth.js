// Authentication is now fully handled by AuthContext and apiClient.
// This file is kept only for backward compatibility if any old components import from it directly.

// eslint-disable-next-line no-unused-vars
export const loginWithEmail = async (_email, _password) => {
    throw new Error('Please use signIn from useAuth hook');
}

// eslint-disable-next-line no-unused-vars
export const signUpWithEmail = async (_email, _password, _metadata) => {
    throw new Error('Please use signUp from useAuth hook');
}

export const signOut = async () => {
    throw new Error('Please use signOut from useAuth hook');
}
