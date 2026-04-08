import { Spinner } from "react-bootstrap";

const LoadingPage = () => {
    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 9999
            }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Xin chờ...</p>
                </div>
            </div>
        </>
    );
}

export default LoadingPage;