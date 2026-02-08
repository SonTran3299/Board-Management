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
                            <Nav.Link as={Link} to="/auth/login">Login</Nav.Link>
                            <Nav.Link as={Link} to="/auth/sign-up">Sign up</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>);
}

export default Home;