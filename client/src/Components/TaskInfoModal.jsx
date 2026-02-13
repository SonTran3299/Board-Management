import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Modal, OverlayTrigger, Popover, Row } from "react-bootstrap";

const TaskInfoModal = ({ showModal, handleCloseModal, boardId, card, task, users, refreshTasks, refreshCard }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [taskContent, setTaskContent] = useState({});

    useEffect(() => {
        setTaskContent(task);
        const memberIds = task.assign || [];
        if (memberIds.length > 0 && users.length > 0) {
            const assined = users.filter(u => memberIds.includes(u.id));
            setSelectedUsers(assined);
        }
        else
            setSelectedUsers([]);
    }, [task, showModal]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaskContent({
            ...taskContent,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSaveTask = async () => {
        if (!taskContent.name.trim()) return;
        try {
            await axios.put(`${API_URL}/boards/${boardId}/cards/${card?.id}/tasks/${task?.id}`,
                taskContent,
            );

            if (refreshTasks) {
                await refreshTasks();
            }

            if (refreshCard) {
                await refreshCard();
            }

            handleCloseModal();
        } catch (error) {
            console.log(error);
        }
    }

    const handleSelectedUsers = async (e) => {
        const userId = e.target.value;
        if (!userId) return;

        const userInfo = users.find(u => u.id === userId);

        if (userInfo && !selectedUsers.some(u => u.id === userId)) {
            try {
                await axios.post(`${API_URL}/boards/${boardId}/cards/${card?.id}/tasks/${task?.id}/assign`, {
                    memberId: userId
                });

                const selectedUserList = [...selectedUsers, userInfo];
                setSelectedUsers(selectedUserList);

                if (refreshTasks) await refreshTasks();

                setTaskContent({
                    ...taskContent,
                    assign: selectedUserList.map(u => u.id)
                })
            } catch (error) {
                console.log(error);
            }
        }
        e.target.value = "";
    }

    const handleRemoveAssignment = async (userId) => {
        try {
            await axios.delete(`${API_URL}/boards/${boardId}/cards/${card?.id}/tasks/${task?.id}/assign/${userId}`);
            const updateList = selectedUsers.filter(u => u.id !== userId);
            setSelectedUsers(updateList);

            setTaskContent({
                ...taskContent,
                assign: updateList.map(u => u.id)
            })
        } catch (error) {
            console.log(error);
        }
    }

    const popoverDelete = (userId) => (
        <Popover>
            <Popover.Body>
                <Button variant="danger" onClick={() => {
                    handleRemoveAssignment(userId);
                    document.body.click();
                }}>
                    Loại khỏi task
                </Button>
            </Popover.Body>
        </Popover>
    );
    return (
        <>
            <Modal show={showModal} onHide={handleCloseModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {card?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col xs="12" lg="7" className="border-end">
                                <Form.Group>
                                    <Form.Label className="">
                                        <InputGroup>
                                            <InputGroup.Checkbox name="checked" checked={taskContent?.checked || false}
                                                onChange={handleChange} />
                                            <Form.Control as="textarea" className="fw-bold fs-5 border-0"
                                                style={{
                                                    resize: 'none', backgroundColor: 'transparent'
                                                }}
                                                name="name"
                                                value={taskContent?.name} onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group >
                                    <Form.Label>
                                        Thêm thành viên
                                    </Form.Label>
                                    <Form.Select className="mb-2" onChange={handleSelectedUsers}>
                                        <option value={""}>Chọn người dùng muốn thêm vào bảng</option>
                                        {
                                            users.filter(user => !selectedUsers.some(selected => selected.id === user.id))
                                                .map(user => (
                                                    <option key={user.id} value={user.id}>{user?.name}</option>
                                                ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group >
                                    <Form.Label>
                                        Mô tả
                                    </Form.Label>
                                    <Form.Control as="textarea" name="description"
                                        value={taskContent?.description} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs="12" lg="5">
                                {/* <h5 className="fw-bold">Nhận xét và hoạt động</h5>
                                <Form.Group >
                                    <Form.Control as="textarea" placeholder="Thêm nhận xét" name="comment" onChange={handleChange} />
                                </Form.Group> */}
                                <h5 className="fw-bold">Người thực hiện</h5>
                                <div>
                                    {
                                        selectedUsers.length > 0 ? (
                                            selectedUsers.map(user => (
                                                <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popoverDelete(user.id)} key={user.id}>
                                                    <Button variant="outline-primary" className="me-1" key={user.id}>{user.name}</Button>
                                                </OverlayTrigger>
                                            ))
                                        ) : <></>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSaveTask}>Lưu</Button>
                    <Button variant="secondary" onClick={handleCloseModal}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TaskInfoModal;