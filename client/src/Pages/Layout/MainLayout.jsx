import { Container, Nav, Navbar, NavDropdown, Offcanvas } from "react-bootstrap";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { database } from "../../../firebase";
import { useCallback, useEffect, useState } from "react";
import { child, get, ref } from "firebase/database";
import { useAuth } from "../../Hooks/AuthContext";
import axios from "axios";

const MainLayout = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const [userInfo, setUserInfo] = useState({});

    const fetchUser = useCallback(async () => {
        if (!user?.uid) return;

        try {
            const res = await axios.get(`${API_URL}/users/${user.uid}`);
            setUserInfo(res.data);
        } catch (error) {
            console.log(error);
        }
    }, [user?.uid, API_URL]);

    useEffect(() => {
        fetchUser();
    }, [user?.uid]);

    const handleLogOut = async () => {
        await logOut();
        navigate('/');
    }
    return (
        <>
            <div className="d-flex flex-column min-vh-100">
                <Navbar expand="lg" className="border-bottom">
                    <Container>
                        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${"lg"}`} className="ms-auto" />
                        <Navbar.Offcanvas
                            id={`offcanvasNavbar-expand-${"lg"}`}
                            aria-labelledby={`offcanvasNavbarLabel-expand-${"lg"}`}
                            placement="end"
                        >
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${"lg"}`}>

                                </Offcanvas.Title>
                            </Offcanvas.Header>

                            <Offcanvas.Body className="ps-3 ps-lg-0">
                                <Navbar.Collapse id="nav-bar">
                                    <Nav className="me-auto">
                                        <Nav.Link as={Link} to={'/dashboard'} className="fs-5">Dashboard</Nav.Link>
                                    </Nav>
                                    <NavDropdown title={userInfo.name || "None"} className="fs-5">
                                        <NavDropdown.Item as={Link} to={'/user-profile'}>Hồ sơ người dùng</NavDropdown.Item>
                                        <NavDropdown.Item type="button" onClick={handleLogOut}>Đăng xuất</NavDropdown.Item>
                                    </NavDropdown>
                                </Navbar.Collapse>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>

                <Outlet />

                <Container fluid className="pb-4 pt-2 mt-auto" style={{ backgroundColor: 'rgb(117, 117, 163)' }}>
                    <div>
                        Tên: Trần Văn Sơn
                    </div>
                </Container>
            </div>

        </>
    );
}

export default MainLayout;