import { Button, Card, Container, Form, InputGroup, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { useAuth } from "../Hooks/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Cards from "./Cards";
import AlertModal from "./AlertModal";
import { useCallback } from "react";
import ButtonPopover from "./ButtonPopover";

//là board Chứa các cards là những ô chứa các task
const Boards = ({ board, users }) => {
    const [cards, setCards] = useState([]);
    const { user } = useAuth();
    const [newCard, setNewCard] = useState({ name: '', description: '' });
    const [boardName, setBoardName] = useState(board?.name);
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalDetail, setshowModalDetail] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });

    const getCards = useCallback(async () => {
        if (!board?.id) {
            return;
        }
        await axios.get(`${API_URL}/boards/${board?.id}/cards`)
            .then(res => setCards(res.data))
            .catch(error => console.log("Loi tai sanh sach the", error))
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
            await axios.post(`${API_URL}/boards/${board?.id}/cards`, {
                name: newCard.name,
                description: newCard.description,
                owner: user.uid,
                createdAt: new Date().toISOString()
            });
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
        setShowModalDelete(false);
    }

    const handleCloseModalDetail = () => {
        setshowModalDetail(false);
    }

    const handleUpdateBoardName = async () => {
        if (!boardName.trim()) return;
        await axios.put(`${API_URL}/boards/${board?.id}`, {
            name: boardName
        }).catch(error => {
            console.log("loi:", error);
        })
    }

    const handelDeleteBoard = async () => {
        try {
            await axios.delete(`${API_URL}/boards/${board?.id}`);
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseAlert = () => {
        setAlert({ show: false, message: '', title: '' });
    }

    const popover = (
        <ButtonPopover setModalInfo={setshowModalDetail} setModalDelete={setShowModalDelete}
            infoTitle={"Xem chi tiết"} deleteTitle={"Xoá bảng"} />
    );
    return (
        <>
            <Card className="my-2" style={{
                height: '95vh'
            }}>
                <Card.Header>
                    <Card.Title>
                        <Container fluid className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                            <Form>
                                <InputGroup>
                                    <Form.Control type="input" value={boardName} className="fs-4 border-0"
                                        onChange={(e) => setBoardName(e.target.value)}
                                        onBlur={handleUpdateBoardName} />
                                    <OverlayTrigger trigger={"click"} placement="right" rootClose overlay={popover}>
                                        <Button className="rounded"><i className="bi bi-pencil-square"></i></Button>
                                    </OverlayTrigger>
                                </InputGroup>
                            </Form>
                            <Button variant="secondary" className="" onClick={(e) => { setShowModal(true) }}>
                                <i className="bi bi-plus-lg"></i> Thêm thẻ
                            </Button>
                        </Container>
                    </Card.Title>
                </Card.Header>

                <Card.Body className="d-flex flex-column">
                    <div className="d-flex flex-row flex-nowrap overflow-x-auto align-items-start pb-2" style={{ flex: 1 }}>
                        {
                            cards?.map(item => (
                                <div key={item.id}>
                                    <Cards card={item} board={board} users={users} refreshCard={getCards} />
                                </div>
                            ))
                        }
                    </div>
                </Card.Body>
            </Card>

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
                            onChange={handleChange} />
                        <Form.Label>
                            Nhập mô tả của thẻ
                        </Form.Label>
                        <Form.Control as="textarea" className="mb-2" value={newCard.description} name="description"
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
                    Bạn có chắc muốn xoá bảng này không. Nếu xoá sẽ mất hết dữ liệu.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handelDeleteBoard}>Xoá bảng</Button>
                    <Button variant="secondary" onClick={handleCloseModalDelete}>Huỷ xoá</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModalDetail} onHide={handleCloseModalDetail}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tên: {board?.name}</p>
                    <p>Mô tả: {board?.description} </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalDetail}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            <AlertModal alertObj={alert} closeAlert={handleCloseAlert} />
        </>
    );
}

export default Boards;