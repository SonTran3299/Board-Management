import axios from "axios";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [userInfo, setUserInfo] = useState({});
    const auth = getAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

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
                                Authorization: `Send ${idToken}`
                            }
                        });
                        alert('Dang nhap thanh cong');
                        setUserInfo({ email: '', password: '' });
                        navigate('/dashboard');
                    } catch (error) {
                        alert('Loi xac thuc');
                    }

                }).catch(error => {
                    if (error.code === 'auth/invalid-credential') {
                        alert('Sai ten email hoac khau');
                    }
                });
        } else {
            alert('Nhap thong tin nguoi dung');
            return;
        }
    }

    const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
    const REDIRECT_URI = "http://localhost:5000/auth/github/callback";
    const SCOPE = "repo user";

    const gitHubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
    return (
        <>
            <Container className="mt-4">
                <Row>
                    <Col md="6">
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Email
                                </Form.Label>
                                <Form.Control type="email" name="email" onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Password
                                </Form.Label>
                                <Form.Control type="password" name="password"
                                    onChange={handleChange} />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit">Đăng nhập</Button>
                            </div>
                        </Form>
                        <div className="d-flex justify-content-end mt-2">
                            <Button variant="primary" href={gitHubAuthUrl}>Đăng nhập bằng GitHub</Button>
                        </div>

                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Login;