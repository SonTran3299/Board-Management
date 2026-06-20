import { Button, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { useState } from "react";
import TaskInfoModal from "./TaskInfoModal";
import axios from "axios";
import DeleteModal from "../../../Components/DeleteModal";

// Nội dung trên thẻ nhiệm vụ, là các task
const Tasks = ({ board, card, task, users, refreshTask, refreshCard }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [modalDelete, setModalDelete] = useState({
        show: false,
        title: 'Cảnh báo',
        message: 'Bạn có chắc muốn xoá nhiệm vụ này không. Nếu xoá sẽ mất hết dữ liệu!',
        feature: 'Xoá nhiệm vụ',
        cancel: 'Huỷ xoá'
    });

    const handelDeleteTask = async () => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks/${task?.id}`);
            handleCloseDeleteModal();

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
                    setModalDelete(prev => ({ ...prev, show: true }))
                    document.body.click();
                }}>
                    Xoá nhiệm vụ
                </Button>
            </Popover.Body>
        </Popover>
    )

    const handleCloseInfoModal = () => {
        setShowModalInfo(false);
    }

    const handleCloseDeleteModal = () => {
        setModalDelete(prev => ({ ...prev, show: false }));
    }

    return (
        <>
            <InputGroup className="mb-3">
                <InputGroup.Checkbox checked={task?.checked || false} onChange={handleCheckedTask} />
                <Form.Control as="textarea" type="button" className="overflow-hidden" style={{ resize: 'none' }} readOnly
                    onClick={() => setShowModalInfo(true)} value={task?.name} />
                <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                    <Button variant="outline-primary" className="rounded"><i className="bi bi-pencil-square"></i></Button>
                </OverlayTrigger>
            </InputGroup>

            <TaskInfoModal showModal={showModalInfo} handleCloseModal={handleCloseInfoModal}
                boardId={board?.id} card={card} task={task} users={users} refreshTasks={refreshTask} refreshCard={refreshCard} />

            <DeleteModal handleClose={handleCloseDeleteModal} deleteObj={modalDelete} handleFeature={handelDeleteTask} />
        </>
    );
}

export default Tasks;