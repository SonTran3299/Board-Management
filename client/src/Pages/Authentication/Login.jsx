import axios from "axios";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../Components/AlertModal";

const Login = () => {
    const [userInfo, setUserInfo] = useState({});
    const auth = getAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    }

    const handleLogin = (e) => {
        e.preventDefault();
        const { email, password } = userInfo;
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then(async userCredential => {
                    const user = userCredential.user;

                    const idToken = await user.getIdToken();

                    try {
                        const response = await axios.post(`${API_URL}/auth/login`, {}, {
                            headers: {
                                Authorization: `Bearer ${idToken}`
                            }
                        });
                        setUserInfo({ email: '', password: '' });
                        navigate('/dashboard');
                    } catch (error) {
                        setAlert({ show: true, message: 'Lỗi xác thực', title: 'Lỗi' });
                    }

                }).catch(error => {
                    if (error.code === 'auth/invalid-credential') {
                        setAlert({ show: true, message: 'Nhập sai email hoặc mật khẩu', title: 'Lỗi nhập liệu' });
                    }
                });
        } else {
            alert('Nhap thong tin nguoi dung');
            return;
        }
    }

    const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
    const REDIRECT_URI = `${API_URL}/auth/github/callback`;
    const SCOPE = "repo user";

    const gitHubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

    const handleCloseAlert = () => {
        setAlert({ show: false, message: '', title: '' });
    }
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Row className="w-100 justify-content-center">
                    <Col md="6" >
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Email
                                </Form.Label>
                                <Form.Control type="email" name="email" onChange={handleChange}
                                    placeholder="Nhập Email" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Password
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control type={showPassword ? "text" : "password"} name="password"
                                        onChange={handleChange}
                                        style={{ borderRight: 'none' }}
                                        placeholder="Nhập mật khẩu" />
                                    <Button variant="outline-secondary"
                                        style={{
                                            borderLeft: 'none',
                                            backgroundColor: 'transparent',
                                            borderColor: '#ced4da',
                                            color: '#6c757d'
                                        }}
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" type="submit" className="w-50">Đăng nhập</Button>
                            </div>
                        </Form>
                        <div className="d-flex justify-content-center mt-2 border-top pt-2">
                            <Button variant="outline-primary" href={gitHubAuthUrl} className="w-50">
                                <i className="bi bi-github"></i> Đăng nhập bằng GitHub
                            </Button>
                        </div>
                        <div className="d-flex justify-content-center mt-2">
                            <Button variant="outline-danger" onClick={() => navigate('/auth/sign-up')} className="w-50">
                                Chưa có tài khoản? Đăng ký ngay
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>

            <AlertModal alertObj={alert} closeAlert={handleCloseAlert} />
        </>
    );
}

export default Login;