import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <>
            <Navbar expand="lg">
                <Container>
                    <Navbar.Toggle aria-controls="nav-bar"></Navbar.Toggle>
                    <Navbar.Collapse id="nav-bar">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/auth/login" className="fs-5">Login</Nav.Link>
                            <span className="nav nav-link">/</span>
                            <Nav.Link as={Link} to="/auth/sign-up"className="fs-5">Sign up</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>);
}

export default Home;