import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginGit = () => {
    const auth = getAuth();
    const [searchParam] = useSearchParams();
    const navigate = useNavigate();
    useEffect(() => {
            const token = searchParam.get('fb_token');
            if (token) {
                signInWithCustomToken(auth, token)
                    .then(() => {
                        navigate('/dashboard', {replace: 'true'});
                    }).catch(error => console.log(error));
            }
        }, [searchParam]);
    return ( 
        <>
        </>
     );
}
 
export default LoginGit;