import { Button, Card, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import Tasks from "./Tasks";

//là card Chứa tasks
const Cards = ({ card, board, users }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [tasks, setTasks] = useState([]);
    const [cardName, setCardName] = useState(card?.name);
    const [showModal, setShowModal] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const getTask = async () => {
        axios.get(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks`)
            .then(res => {
                setTasks(res.data);
            })
            .catch(error => {
                console.log("Loi tai sanh sach nhiem vu");
            });
    }
    useEffect(() => {
        getTask();
    }, [getTask]);

    useEffect(() => {
        if (card && users.length > 0) {
            const ids = card.list_member || [];
            const members = users.filter(u => ids.includes(u.id));
            setSelectedUsers(members);
        } else {
            setSelectedUsers([]);
        }
    }, [card?.list_member, users]);

    const handleUpdateCardName = async () => {
        if (!cardName.trim()) return;
        await axios.put(`${API_URL}/boards/${board?.id}/cards/${card?.id}`, {
            name: cardName
        }).catch(error => {
            console.log("loi:", error);
        })
    }

    const handelDeleteCard = async () => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}/cards/${card?.id}`);
            setShowModalDelete(false);
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
                await axios.post(`${API_URL}/boards/${board?.id}/cards/${card?.id}/list_member`, {
                    memberId: userId
                });
                setSelectedUsers(prev => [...prev, userInfo]);
            } catch (error) {
                console.log(error);
            }W
        }
        e.target.value = "";
    }

    const handleRemoveMember = async (userId) => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}/cards/${card?.id}/list_member/${userId}`);
            setSelectedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.log(error);
        }
    }

    const popover = (
        <Popover>
            <Popover.Body>
                <Button variant="info" className="me-2" onClick={() => {
                    setShowModalDetail(true);
                    document.body.click();
                }}>
                    Xem chi tiết
                </Button>
                <Button variant="danger" onClick={() => {
                    setShowModalDelete(true);
                    document.body.click();
                }}>
                    Xoá
                </Button>
            </Popover.Body>
        </Popover>
    );

    const popoverMember = (userId) => (
        <Popover>
            <Popover.Body>
                <Button variant="danger" onClick={() => {
                    handleRemoveMember(userId)
                    document.body.click();
                }}>
                    Xoá thành viên
                </Button>
            </Popover.Body>
        </Popover>
    );

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks`, {
                name: newTaskName,
                description: "",
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setNewTaskName("");
        } catch (error) {
            console.log(error);
        }
    }
    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleCloseModalDelete = () => {
        setShowModalDelete(false);
    }

    const handleCloseModalDetail = () => {
        setShowModalDetail(false);
    }
    return (
        <>
            <Card style={{ width: '18rem' }} className="me-2">
                <Card.Body>
                    <Card.Title className="mb-2">
                        <Form>
                            <InputGroup>
                                <Form.Control type="input" value={cardName} className="fs-4 border-0"
                                    onChange={(e) => setCardName(e.target.value)}
                                    onBlur={handleUpdateCardName} />
                                <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                                    <Button className="rounded"><i className="bi bi-pencil-square"></i></Button>
                                </OverlayTrigger>
                            </InputGroup>
                        </Form>
                    </Card.Title>
                    {tasks.map(item => (
                        <Tasks board={board} task={item} card={card} users={users} />
                    ))}
                </Card.Body>
                <Card.Footer>
                    <Button variant="outline-primary" className="w-100" onClick={(e) => setShowModal(true)}>
                        <i className="bi bi-plus-lg"></i>
                    </Button>
                </Card.Footer>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm nhiệm vụ mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddTask}>
                        <Form.Label>
                            Nhập tên nhiệm vụ
                        </Form.Label>
                        <Form.Control as="input" className="mb-2" value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)} />
                        <Button variant="success" type="submit">Lưu</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showModalDelete} onHide={handleCloseModalDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Cảnh báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xoá thẻ này không. Nếu xoá sẽ mất hết dữ liệu.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelDeleteCard}>Xoá thẻ</Button>
                    <Button variant="secondary" onClick={handleCloseModalDelete}>Huỷ xoá</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModalDetail} onHide={handleCloseModalDetail}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết thẻ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tên: {card?.name}</p>
                    <p>Mô tả: {card?.description} </p>
                    <Form>
                        <Form.Group >
                            <Form.Label>
                                Thêm thành viên
                            </Form.Label>
                            <Form.Select className="mb-2" onChange={handleSelectedUsers}>
                                <option value={""}>Chọn người dùng muốn thêm vào bảng</option>
                                {
                                    users.map(user => (
                                        <option key={user.id} value={user.id}>{user?.name}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Form>
                    <h5 className="fw-bold">Người thực hiện</h5>
                    <div>
                        {
                            selectedUsers.length > 0 ? (
                                selectedUsers.map(user => (
                                    <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popoverMember(user.id)}>
                                        <Button variant="outline-primary" className="me-1" key={user.id}>{user.name}</Button>
                                    </OverlayTrigger>
                                ))
                            ) : <>
                            
                            </>
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalDetail}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Cards;