import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import Boards from "../Components/Boards";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Hooks/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [users, setUsers] = useState([]);
    const [newBoardName, setNewBoardName] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [repoData, setRepoData] = useState(null);
    const [showModalRepo, setShowModalRepo] = useState(false);
    const [repoInput, setRepoInput] = useState({ owner: '', repo: '' });
    const [loading, setLoading] = useState(false);

    const getBoards = async () => {
        axios.get(`${API_URL}/boards`)
            .then(res => {
                setBoards(res.data);
            })
            .catch(error => {
                console.log("Loi tai sanh sach bang");
            });
    };

    const getUsers = async () => {
        axios.get(`${API_URL}/users`)
            .then(res => {
                setUsers(res.data);
            }).catch(error => {
                console.log(error);
            })
    }

    const getRepoData = async (owner, repo) => {
        try {
            const res = await axios.get(`${API_URL}/repositories/${owner}/${repo}/github-info?uid=${user.uid}`);
            setRepoData(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getBoards();
        getUsers();
    }, [getBoards]);

    const handleAddBoard = async (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) {
            alert("Nhap ten bang");
            return;
        }
        try {
            await axios.post(`${API_URL}/boards`, {
                name: newBoardName
            });
            await getBoards();
            setNewBoardName("");
            setShowModal(false);

        } catch (error) {
            console.log("loi:", error);
        }
    }

    const handleGetRepo = () => {
        if (repoInput.owner && repoInput.repo) {
            getRepoData(repoInput.owner, repoInput.repo);
        } else {
            alert('Nhap thong tin');
        }
    }

    const handleChangeRepo = (e) => {
        setRepoInput({ ...repoInput, [e.target.name]: e.target.value });
    }

    const handleCloseModalRepo = () => {
        setShowModalRepo(false);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    return (
        <>
            <Container fluid className="border-top ">
                <div className="d-flex justify-content-between px-3">
                    <Button variant="secondary" className="mt-3 me-2" onClick={(e) => { setShowModal(true) }}>
                        <i className="bi bi-plus-lg"></i> Thêm bảng
                    </Button>
                    <Button variant="secondary" className="mt-3" onClick={(e) => { setShowModalRepo(true) }}>
                        <i className="bi bi-plus-lg"></i> Xem Respository
                    </Button>
                </div>

                <Row className="h-100">
                    <Col className="h-100 overflow-hidden">
                        {
                            boards.map(item => (
                                <Boards board={item} users={users} />
                            ))
                        }
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm bảng mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddBoard}>
                        <Form.Label>
                            Nhập tên bảng mới
                        </Form.Label>
                        <Form.Control as="input" className="mb-2" value={newBoardName}
                            onChange={e => setNewBoardName(e.target.value)} />
                        {/* <Form.Select className="mb-2">
                            <option value={""}>Chọn người dùng muốn thêm vào bảng</option>
                            {
                                users.map(user =>(
                                    <option value={user.id}>{user?.name}</option>
                                ))
                            }
                        </Form.Select> */}
                        <Button variant="success" type="submit">Lưu</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showModalRepo} onHide={handleCloseModalRepo} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Xem Repo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={e => {
                        e.preventDefault();
                        handleGetRepo();
                    }}>
                        <div className="mb-2 d-flex gap-2">
                            <Form.Group className="flex-grow-1">
                                <Form.Control type="text"
                                    required
                                    placeholder="Github Owner"
                                    name="owner"
                                    value={repoInput.owner}
                                    onChange={handleChangeRepo}
                                />
                            </Form.Group>
                            <Form.Group className="flex-grow-1">
                                <Form.Control type="text"
                                    required
                                    placeholder="Github Repo"
                                    name="repo"
                                    value={repoInput.repo}
                                    onChange={handleChangeRepo}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">Xem</Button>
                        </div>
                    </Form>
                    {
                        repoData?.repositoryId && (
                            <div className="mt-4">
                                <h5>Repo: {repoData.repositoryId}</h5>
                                <hr />
                                <p>Branches: {repoData?.branches?.length}</p>
                                <p>Issues: {repoData?.issues?.length}</p>
                            </div>
                        )
                    }
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Dashboard;