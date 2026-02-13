import { Button, Card, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import Tasks from "./Tasks";
import { useCallback } from "react";
import { useAuth } from "../Hooks/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ButtonPopover from "./ButtonPopover";

//là card Chứa tasks
const Cards = ({ card, board, users, refreshCard }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [tasks, setTasks] = useState([]);
    const [cardName, setCardName] = useState(card?.name);
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { user } = useAuth();
    const [newTask, setNewTask] = useState({ name: '', description: '' });

    const getTasks = useCallback(async () => {
        if (!board.id || !card.id) return;
        try {
            const res = await axios.get(`${API_URL}/boards/${board.id}/cards/${card.id}/tasks`);
            setTasks(res.data);
        } catch (error) {
            console.log("Lỗi tải danh sách nhiệm vụ.", error);
        }
    }, [board?.id, card?.id, API_URL]);

    useEffect(() => {
        getTasks();
    }, [getTasks]);

    useEffect(() => {
        const ids = card.list_member || [];
        if (users.length > 0) {
            const members = users.filter(u => ids.includes(u.id));
            setSelectedUsers(members);
        }
    }, [JSON.stringify(card?.list_member), users?.id]);

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
            if (refreshCard) {
                await refreshCard();
            }
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
                if (refreshCard) {
                    await refreshCard();
                }
            } catch (error) {
                console.log(error);
            }
        }
        e.target.value = "";
    }

    const handleRemoveMember = async (userId) => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}/cards/${card?.id}/list_member/${userId}`);
            if (refreshCard) {
                await refreshCard();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const popover = (
        <ButtonPopover setModalInfo={setShowModalDetail} setModalDelete={setShowModalDelete}
            infoTitle={"Xem chi tiết"} deleteTitle={"Xoá thẻ"} />
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

    const handleChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value })
    }

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/boards/${board?.id}/cards/${card?.id}/tasks`, {
                name: newTask.name,
                description: newTask.description,
                owner: user.uid,
                createdAt: new Date().toISOString()
            });
            await getTasks();
            setShowModal(false);
            setNewTask({ name: '', description: '' });
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
                <Card.Header>
                    <Card.Title className="mb-2">
                        <Form>
                            <InputGroup>
                                <Form.Control type="input" value={cardName} className="fs-4 border-0"
                                    onChange={(e) => setCardName(e.target.value)}
                                    onBlur={handleUpdateCardName} />
                                <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                                    <Button variant="outline-primary" className="rounded"><i className="bi bi-pencil-square"></i></Button>
                                </OverlayTrigger>
                            </InputGroup>
                        </Form>
                    </Card.Title>
                </Card.Header>

                {/* <Droppable droppableId={card.id.toString()}>
                    {(provided) => ( */}
                <Card.Body
                // {...provided.droppableProps}
                // ref={provided.innerRef}
                >
                    {
                        tasks.map((item, index) => (
                            // <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                            //     {(provided) => (
                                    <div
                                        // ref={provided.innerRef}
                                        // {...provided.draggableProps}
                                        // {...provided.dragHandleProps}
                                        // style={{
                                        //     ...provided.draggableProps.style,
                                        //     userSelect: "none",
                                        // }}
                                    >
                                        <Tasks key={item.id} board={board} task={item} card={card} users={users} refreshTask={getTasks} refreshCard={refreshCard} />
                                    </div>
                            //     )}
                            // </Draggable>
                        ))
                    }
                    {/* {provided.placeholder} */}
                </Card.Body>
                {/* )} */}
                {/* </Droppable> */}

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
                        <Form.Control as="input" className="mb-2" value={newTask.name} name="name"
                            onChange={handleChange} />

                        <Form.Label>
                            Nhập mô tả nhiệm vụ
                        </Form.Label>
                        <Form.Control as="textarea" className="mb-2" value={newTask.description} name="description"
                            onChange={handleChange} />
                        <Button variant="success" type="submit" className="mt-2">Lưu</Button>
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
                                <option value={""}>Chọn người dùng muốn thêm vào thẻ</option>
                                {
                                    users.filter(user => !selectedUsers.some(selected => selected.id === user.id))
                                        .map(user => (
                                            <option key={user.id} value={user.id}>{user?.name}</option>
                                        ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Form>
                    <h5 className="fw-bold mt-3">Người thực hiện</h5>
                    <div>
                        {
                            selectedUsers.length > 0 ? (
                                selectedUsers.map(user => (
                                    <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popoverMember(user.id)} key={user.id}>
                                        <Button variant="outline-primary" className="me-1" key={user.id}>{user.name}</Button>
                                    </OverlayTrigger>
                                ))
                            ) : <>...</>
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