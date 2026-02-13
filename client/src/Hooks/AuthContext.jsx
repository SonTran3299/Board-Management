import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const auth = getAuth();
    const [user, setUser] = useState();
    const [reload, setReload] = useState(true);
    useEffect(() => {
        const subcribeUser = onAuthStateChanged(auth, authUser => {
            if (authUser) {
                setUser(authUser);

            } else {
                setUser(null);
            }
            setReload(false);
        })
        return () => subcribeUser();
    }, [auth]);
    const logOut = () => {
        return signOut(auth);
    }
    return (
        <>
            <AuthContext.Provider value={{ user, logOut, reload }}>
                {
                    !reload ? children :
                        <Container className="d-flex justify-content-center align-items-center"
                            style={{ minHeight: "100vh" }}>
                            <Spinner animation="border" />
                        </Container>
                }
            </AuthContext.Provider>
        </>
    );
}

const useAuth = () => {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };