import { Button, Card, Container, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAuth } from "../../../Hooks/AuthContext";
import Cards from "./Cards";
import api from "../../../function/api";
import ButtonPopover from "../../../Components/ButtonPopover";
import AlertModal from "../../../Components/AlertModal";
import DeleteModal from "../../../Components/DeleteModal";

//là board chứa các cards là những ô chứa các task
const Boards = ({ board, users, onDeleteBoard, onUpdateSuccess }) => {
    const [cards, setCards] = useState([]);
    const { user } = useAuth();
    const [newCard, setNewCard] = useState({ name: '', description: '' });
    const [boardData, setBoardData] = useState(board);

    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [showModalDetail, setshowModalDetail] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        title: 'Cảnh báo',
        message: 'Bạn có chắc muốn xoá bảng này không. Nếu xoá sẽ mất hết dữ liệu.',
        feature: 'Xoá bảng',
        cancel: 'Huỷ xoá'
    });

    const getCards = useCallback(async () => {
        if (!board?.id) return;
        try {
            const res = await axios.get(`${API_URL}/boards/${board?.id}/cards`);
            setCards(res.data);
        } catch (error) {
            console.log("Loi tai sanh sach the", error)
        }
    }, [board?.id, API_URL])

    useEffect(() => {
        getCards();
    }, [getCards]);

    const handleChange = (e) => {
        setNewCard({ ...newCard, [e.target.name]: e.target.value });
    }

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/boards/${board?.id}/cards`, {
                name: newCard.name,
                description: newCard.description,
                owner: user.uid,
                createdAt: new Date().toISOString()
            });

            const newCardId = res.data.cardId;
            if (newCardId) {
                setBoardData(prev => ({
                    ...prev,
                    cardOrder: [...(prev.cardOrder || []), newCardId]
                }));
            }

            setShowModal(false);
            setNewCard({ name: '', description: '' });
            await getCards();
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleCloseModalDelete = () => {
        setDeleteModal(prev => ({ ...prev, show: false }));
    }

    const handleCloseModalDetail = () => {
        setshowModalDetail(false);
    }

    const handleUpdateBoardName = async () => {
        try {
            if (!boardData?.name.trim()) return;

            await axios.put(`${API_URL}/boards/${board?.id}`, {
                name: boardData?.name
            })

            const updatedObject = { ...board, name: boardData.name };
            onUpdateSuccess(updatedObject);
        } catch (error) {
            console.log("loi:", error);
        }
    }

    const handleDeleteBoard = async () => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}`);
            handleCloseModalDelete();

            if (onDeleteBoard) {
                await onDeleteBoard(board?.id);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseAlert = () => {
        setAlert({ show: false, message: '', title: '' });
    }

    const popover = (
        <ButtonPopover setModalInfo={setshowModalDetail}
            setDeleteModal={() => setDeleteModal(prev => ({ ...prev, show: true }))}
            infoTitle={"Xem chi tiết"} deleteTitle={"Xoá bảng"} />
    )

    const updateCardTaskOrder = (cardId, newTaskOrder) => {
        setCards(prevCards => prevCards.map(c =>
            c.id === cardId ? { ...c, taskOrder: newTaskOrder } : c
        ));
    };

    const updateBoardOrderOnDb = async (newCardOrder) => {
        try {
            await api.patch(`/boards/${boardData?.id}/reorder`, {
                cardOrder: newCardOrder
            })
        } catch (error) {
            console.error("Lỗi khi lưu thứ tự card:", error);
        }
    }

    const updateTaskOrder = async (cardId, newTaskOrder) => {
        try {
            await api.patch(`/boards/${boardData?.id}/cards/${cardId}/reorder`, {
                taskOrder: newTaskOrder
            })
        } catch (error) {
            console.error("Lỗi khi lưu thứ tự card:", error);
        }
    }

    //--------------Dnd--------------
    const onDragEnd = async (result) => {
        const { destination, source, type, draggableId } = result;
        if (!destination ||
            (destination.droppableId === source.droppableId && destination.index === source.index)
        ) return;

        if (type === "column") {
            const newCardOrder = Array.from(boardData.cardOrder || []);

            newCardOrder.splice(source.index, 1);
            newCardOrder.splice(destination.index, 0, draggableId);

            setBoardData(prev => ({
                ...prev,
                cardOrder: newCardOrder
            }));

            await updateBoardOrderOnDb(newCardOrder);
            return;
        }

        const startCardId = source.droppableId;
        const finishCardId = destination.droppableId;

        if (startCardId === finishCardId) {
            const card = cards.find(c => c.id === startCardId);
            if (!card) return;

            const newTaskOrder = Array.from(card.taskOrder || []);
            const [reorderedTaskId] = newTaskOrder.splice(source.index, 1);
            newTaskOrder.splice(destination.index, 0, reorderedTaskId);

            setCards(prevCards => prevCards.map(card =>
                card.id === startCardId ? { ...card, taskOrder: newTaskOrder } : card
            ));

            updateTaskOrder(startCardId, newTaskOrder);
        } else {
            // const startTaskOrder = Array.from(cards.find(c => c.id === startCardId).taskOrder || []);
            // const finishTaskOrder = Array.from(cards.find(c => c.id === finishCardId).taskOrder || []);
            // const [movedTaskId] = startTaskOrder.splice(source.index, 1);
            // finishTaskOrder.splice(destination.index, 0, movedTaskId);

            // moveTaskBetweenCards(startCardId, startTaskOrder, finishCardId, finishTaskOrder, movedTaskId);
        }
    }
    //--------------------------------------

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Card id={board.id} className="my-2"
                    style={{ height: '95vh', display: 'flex', flexDirection: 'column' }}>
                    <Card.Header>
                        <Card.Title>
                            <Container fluid className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                                <Form>
                                    <InputGroup>
                                        <Form.Control type="input" value={boardData?.name} className="fs-4 border-0"
                                            onChange={(e) => setBoardData(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))}
                                            onBlur={handleUpdateBoardName} />
                                        <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                                            <Button className="rounded"><i className="bi bi-pencil-square"></i></Button>
                                        </OverlayTrigger>
                                    </InputGroup>
                                </Form>
                                <Button variant="primary"
                                    onClick={(e) => { setShowModal(true) }}>
                                    <i className="bi bi-plus-lg"></i> Thêm thẻ
                                </Button>
                            </Container>
                        </Card.Title>
                    </Card.Header>

                    <Droppable droppableId="all-cards" direction="horizontal" type="column">
                        {
                            provided => (
                                <Card.Body
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="d-flex flex-row flex-nowrap align-items-stretch pb-2"
                                    style={{
                                        flex: 1,
                                        overflowX: 'auto',
                                        overflowY: 'hidden',
                                        minHeight: 0
                                    }}
                                >
                                    <div className="d-flex flex-row flex-nowrap overflow-x-auto align-items-start pb-2"
                                        style={{ flex: 1 }}>

                                        {
                                            boardData?.cardOrder.map((cardId, index) => {
                                                const cardData = cards.find(c => c.id === cardId);

                                                if (!cardData) return null;

                                                return (
                                                    <Draggable key={cardData.id} draggableId={cardData.id.toString()} index={index}>
                                                        {
                                                            draggableProvided => (
                                                                <div key={cardId}
                                                                    ref={draggableProvided.innerRef}
                                                                    {...draggableProvided.draggableProps}
                                                                    //{...draggableProvided.dragHandleProps}
                                                                    style={{
                                                                        ...draggableProvided.draggableProps.style,
                                                                        height: '100%',
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    <Cards
                                                                        card={cardData}
                                                                        dragHandleProps={draggableProvided.dragHandleProps}
                                                                        board={boardData} users={users} refreshCard={getCards}
                                                                        updateCardTaskOrder={updateCardTaskOrder} />
                                                                </div>
                                                            )
                                                        }
                                                    </Draggable>
                                                )
                                            })
                                        }
                                    </div>
                                    {provided.placeholder}
                                </Card.Body>
                            )
                        }
                    </Droppable>
                </Card>
            </DragDropContext>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm bảng mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddCard}>
                        <Form.Label>
                            Nhập tên thẻ mới
                        </Form.Label>
                        <Form.Control as="input" className="mb-2" value={newCard.name} name="name"
                            onChange={handleChange} required />
                        <Form.Label>
                            Nhập mô tả của thẻ
                        </Form.Label>
                        <Form.Control as="textarea" className="mb-2" value={newCard.description} name="description"
                            onChange={handleChange} />
                        <Button variant="success" type="submit" className="mt-2">Lưu</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <DeleteModal handleClose={handleCloseModalDelete} deleteObj={deleteModal} handleFeature={handleDeleteBoard} />

            <Modal show={showModalDetail} onHide={handleCloseModalDetail}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tên: {boardData?.name}</p>
                    <p>Mô tả: {boardData?.description} </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalDetail}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* <AlertModal alertObj={alert} closeAlert={handleCloseAlert} /> */}
        </>
    );
}

export default Boards;