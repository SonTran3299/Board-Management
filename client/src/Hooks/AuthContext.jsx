import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const auth = getAuth();
    const [user, setUser] = useState();
    const [reload, setReload] = useState(true);
    useEffect(() => {
        const subcribeUser = onAuthStateChanged(auth, authUser => {
            if (authUser) {
                // localStorage.setItem('userId', JSON.stringify(authUser.uid));
                setUser(authUser);

            } else {
                setUser(null);
            }
            setReload(false);
        })
        return () => subcribeUser();
    }, [auth]);
    const logOut = () => {
        // localStorage.removeItem('userId');
        return signOut(auth);
    }
    return (
        <>
            <AuthContext.Provider value={{ user, logOut, reload }}>
                {!reload ? children : <div>Sninner</div>}
                {/* {children} */}
            </AuthContext.Provider>
        </>
    );
}

const useAuth = () => {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };