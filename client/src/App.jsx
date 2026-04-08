import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import SignUp from "./Pages/Authentication/SignUp"
import Login from "./Pages/Authentication/Login"
import LoginGit from "./Pages/Authentication/LoginGit"
import Profile from "./Pages/User/Profile"
import MainLayout from "./Pages/Layout/MainLayout"
import Dashboard from "./Pages/Dashboard/Dashboard"
import { AuthProvider } from "./Hooks/AuthContext"
import Home from "./Pages/Home"
import AuthMiddleWare from "./Middleware/AuthMiddleWare"
import { AnimatePresence } from "motion/react"

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AnimatePresence>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/login-success" element={<LoginGit />} />
              <Route element={<AuthMiddleWare />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/user-profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="auth">
                <Route path="sign-up" element={<SignUp />} />
                <Route path="login" element={<Login />} />
              </Route>


            </Routes>
          </AnimatePresence>

        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
