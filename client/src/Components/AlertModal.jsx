import { Button, Modal } from "react-bootstrap";

const AlertModal = ({ alertObj, closeAlert }) => {
    return (
        <>
            <Modal show={alertObj.show} onHide={closeAlert}>
                <Modal.Header closeButton>
                    <Modal.Title>{alertObj.title}</Modal.Title>     
                </Modal.Header>
                <Modal.Body>
                    {alertObj.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAlert}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AlertModal;