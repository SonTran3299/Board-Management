import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/AuthContext";

const AuthMiddleWare = () => {
    const { user, reload } = useAuth();
    if(reload){
        return <div>Wait</div>
    }
    if (!user) {
        return <Navigate to='/' replace/>
    }
    else{
        return <Outlet/>
    }
}

export default AuthMiddleWare;