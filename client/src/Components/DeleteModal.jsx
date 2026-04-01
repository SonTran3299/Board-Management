import { Button, Modal } from "react-bootstrap";

const DeleteModal = ({ handleClose, handleFeature,
    deleteObj = {
        show: false,
        title: 'Title',
        message: 'Mesage',
        feature: 'feature',
        cancel: 'Cancel'
    } }) => {
    return (
        <>
            <Modal show={deleteObj.show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{deleteObj.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteObj.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleFeature}>{deleteObj.feature}</Button>
                    <Button variant="secondary" onClick={handleClose}>{deleteObj.cancel}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeleteModal;