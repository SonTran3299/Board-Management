import { Button, Card, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import CardInfoModal from "./TaskInfoModal";
import { useState } from "react";
import { useEffect } from "react";
import TaskInfoModal from "./TaskInfoModal";
import axios from "axios";

// Nội dung trên thẻ nhiệm vụ, là các task
const Tasks = ({ board, card, task, users, refreshTask, refreshCard }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);

    const handelDeleteTask = async () => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks/${task?.id}`);
            setShowModalDelete(false);

            await refreshTask();
        } catch (error) {
            console.log(error);
        }
    }

    const handleCheckedTask = async (e) => {
        const isChecked = e.target.checked;
        try {
            await axios.put(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks/${task?.id}`, {
                ...task,
                checked: isChecked
            });
            await refreshTask();
        } catch (error) {
            console.log(error);
        }
    }

    const popover = (
        <Popover>
            <Popover.Body className="p-2">
                <Button variant="danger" onClick={() => {
                    setShowModalDelete(true);
                    document.body.click();
                }}>
                    Xoá nhiệm vụ
                </Button>
            </Popover.Body>
        </Popover>
    );

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleCloseModalDelete = () => {
        setShowModalDelete(false);
    }

    return (
        <>
            <InputGroup className="mb-3">
                <InputGroup.Checkbox checked={task?.checked || false} onChange={handleCheckedTask} />
                <Form.Control as="textarea" type="button" className="overflow-hidden" style={{ resize: 'none' }} readOnly
                    onClick={() => setShowModal(true)} value={task?.name} />
                <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                    <Button variant="outline-primary" className="rounded"><i className="bi bi-pencil-square"></i></Button>
                </OverlayTrigger>
            </InputGroup>
            <TaskInfoModal showModal={showModal} handleCloseModal={handleCloseModal}
                boardId={board?.id} card={card} task={task} users={users} refreshTasks={refreshTask} refreshCard={refreshCard} />

            <Modal show={showModalDelete} onHide={handleCloseModalDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Cảnh báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xoá nhiệm vụ này không. Nếu xoá sẽ mất hết dữ liệu.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelDeleteTask}>Xoá nhiệm vụ</Button>
                    <Button variant="secondary" onClick={handleCloseModalDelete}>Huỷ xoá</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Tasks;