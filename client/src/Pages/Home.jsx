import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import AnimatedPage from "../Components/AnimatedPage";

const Home = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        function waitForRequest() {
            return new Promise(resolve => {
                setTimeout(resolve, 2000);
            });
        }

        if (isLoading) {
            waitForRequest().then(() => {
                setIsLoading(false);
            });
        }
    }, [isLoading]);

    const handleClick = () => setIsLoading(true);

    return (
        <>
            <AnimatedPage>
                <Container className="d-flex  align-items-center"
                    style={{ minHeight: '100vh' }}>
                    <Card className="text-center w-100 justify-content-center">
                        <Card.Header>Welcome</Card.Header>
                        <Card.Body>
                            <Card.Title>Project Task Management</Card.Title>
                            <Card.Text>
                                Click the link below to take a tour.
                            </Card.Text>
                            <div className="d-flex justify-content-center">
                                <Row style={{ width: '100%', maxWidth: '300px' }}>
                                    <Col px={1}>
                                        <Button variant="primary" as={Link} to="/auth/login" className="w-100"
                                            disabled={isLoading}
                                            onClick={!isLoading ? handleClick : null}>
                                            {isLoading ? 'Loading…' : 'Login'}
                                        </Button>
                                    </Col>
                                    <Col px={1}>
                                        <Button variant="outline-primary" as={Link} to="/auth/sign-up" className="w-100"
                                            disabled={isLoading}
                                            onClick={!isLoading ? handleClick : null}>
                                            {isLoading ? 'Loading…' : 'Register'}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                        </Card.Body>
                    </Card>
                </Container>
            </AnimatedPage>
        </>
    );
}

export default Home;