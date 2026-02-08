import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignUp from "./Pages/Authentication/SignUp"
import Login from "./Pages/Authentication/Login"
import LoginGit from "./Pages/Authentication/LoginGit"
import Profile from "./Pages/User/Profile"
import MainLayout from "./Pages/Layout/MainLayout"
import Dashboard from "./Dashboard/Dashboard"
import { AuthProvider } from "./Hooks/AuthContext"
import Home from "./Pages/Home"
import AuthMiddleWare from "./Components/AuthMiddleWare"

function App() {
  const id = "QVU8MoymdoSPME4r2oElXJDhcmo1";
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
            </Route>

            <Route path="/login-success" element={<LoginGit />} />
            <Route element={<AuthMiddleWare />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="users" element={<Profile />} />
              </Route>
            </Route>


            <Route path="auth">
              <Route path="sign-up" element={<SignUp />} />
              <Route path="login" element={<Login />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
