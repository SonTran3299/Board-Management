import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertModal from "../../Components/AlertModal";
import LoadingPage from "../../Components/LoadingPage";
import AnimatedPage from "../../Components/AnimatedPage";
const SignUp = () => {
    const [userInfo, setUserInfo] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const auth = getAuth();

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        const { email, password } = userInfo;
        let user = null;

        if (email && password) {
            setIsLoading(true);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const res = await axios.post(`${API_URL}/auth/sign-up`, {
                    uid: user.uid,
                    email: user.email,
                    name: user.name || user.email
                })
                setAlert({ show: true, message: 'Đăng ký thành công', title: 'Thành công' });
                setUserInfo({ email: '', password: '' });
                navigate('/dashboard');

            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setAlert({ show: true, message: 'Email đã đăng ký.', title: 'Có lỗi xảy ra' });
                }
                else {
                    setAlert({ show: true, message: 'Lỗi hệ thống, vui lòng thử lại.', title: 'Lỗi' });
                    console.log(error);
                    if (user) {
                        await deleteUser(user);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            setAlert({ show: true, message: 'Hãy nhập thông tin người dùng', title: 'Có lỗi xảy ra' });
            return;
        }
    }

    const handleCloseAlert = () => {
        setAlert({ show: false, message: '', title: '' });
    }
    return (
        <>
            {isLoading && <LoadingPage />}
            <AnimatedPage>
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
                                    <Button variant="primary" type="submit" className="w-50"
                                        disabled={isLoading}>
                                        Đăng ký
                                    </Button>
                                </div>
                                <div className="d-flex justify-content-center mt-2 border-top pt-2">
                                    <Button variant="outline-success" className="w-50"
                                        onClick={() => navigate('/auth/login')}
                                        disabled={isLoading}>
                                        Đã có tài khoản? Đăng nhập ngay
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </AnimatedPage>

            <AlertModal alertObj={alert} closeAlert={handleCloseAlert} />
        </>
    );
}

export default SignUp;