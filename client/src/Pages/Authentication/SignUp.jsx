import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { database } from "../../../firebase";
import axios from "axios";
const SignUp = () => {
    const [userInfo, setUserInfo] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    }

    const auth = getAuth();
    const handleSignUp = (e) => {
        e.preventDefault();
        const { email, password } = userInfo;
        if (email && password) {
            createUserWithEmailAndPassword(auth, email, password)
                .then(async userCreadential => {
                    const user = userCreadential.user;

                    try {
                        await axios.post(`${API_URL}/auth/sign-up`, {
                            uid: user.uid,
                            email: user.email,
                            name: user.name || user.email
                        })
                        alert('Luu thanh cong');
                        setUserInfo({ email: '', password: '' });
                        navigate('/dashboard');
                    } catch (error) {
                        console.log(error);
                        await deleteUser(user);
                    }
                }).catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        alert('Email đã đăng ký.');
                    }
                })
        } else {
            alert('Nhap thong tin nguoi dung');
            return;
        }
    }
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Row className="w-100 justify-content-center">
                    <Col md="6">
                        <Form onSubmit={handleSignUp}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Email
                                </Form.Label>
                                <Form.Control type="email" name="email"
                                    onChange={handleChange} placeholder="Nhập email" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Password
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control type={showPassword ? "text" : "password"} name="password"
                                        onChange={handleChange} 
                                        style={{borderRight: 'none'}}
                                        placeholder="Nhập mật khẩu"/>
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
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit">Đăng ký</Button>
                            </div>
                            <div className="d-flex justify-content-end mt-2">
                            <Button variant="outline-success" onClick={()=> navigate('/auth/login')}>
                                Đã có tài khoản? Đăng nhập ngay
                            </Button>
                        </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SignUp;