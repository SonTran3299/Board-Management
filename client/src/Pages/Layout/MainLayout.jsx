import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { database } from "../../../firebase";
import { useEffect, useState } from "react";
import { child, get, ref } from "firebase/database";
import { useAuth } from "../../Hooks/AuthContext";

const MainLayout = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();
    const dbRef = ref(database);
    const [userInfo, setUserInfo] = useState({});
    useEffect(() => {
        
        get(child(dbRef, `users/${user.uid}`)).then(snapshot => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val());
            }
            else {
                console.log("Khong co du lieu");
            };
        }).catch(error => {
            console.log(error);
        })
    }, [user]);

    const handleLogOut = async () => {
        await logOut();
        navigate('/');
    }
    return (
        <>
            <Navbar expand="lg" className="border-bottom">
                <Container>
                    <Navbar.Toggle aria-controls="nav-bar"></Navbar.Toggle>
                    <Navbar.Collapse id="nav-bar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to={'/dashboard'} className="btn btn-success">Home</Nav.Link>
                        </Nav>
                        <NavDropdown title={userInfo.name || "None"}>
                            <NavDropdown.Item as={Link} to={`/users`}>Hồ sơ người dùng</NavDropdown.Item>
                            <NavDropdown.Item type="button" onClick={handleLogOut}>Đăng xuất</NavDropdown.Item>
                        </NavDropdown>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    );
}

export default MainLayout;