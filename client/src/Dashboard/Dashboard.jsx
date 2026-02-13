import { Badge, Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import Boards from "../Components/Boards";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Hooks/AuthContext";
import AlertModal from "../Components/AlertModal";
import { useCallback } from "react";

const Dashboard = () => {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [users, setUsers] = useState([]);
    const [newBoard, setNewBoard] = useState({ name: '', description: '' });
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [repoData, setRepoData] = useState(null);
    const [showModalRepo, setShowModalRepo] = useState(false);
    const [repoInput, setRepoInput] = useState({ owner: '', repo: '' });
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });

    const getBoards = useCallback(async () => {
        axios.get(`${API_URL}/boards`)
            .then(res => {
                setBoards(res.data);
            })
            .catch(error => {
                console.log("Loi tai sanh sach bang");
                setAlert({ show: true, message: 'Lỗi tải danh sách bảng', title: 'Có lỗi xảy ra' });
            });
    }, [API_URL]);

    const getUsers = useCallback(async () => {
        axios.get(`${API_URL}/users`)
            .then(res => {
                setUsers(res.data);
            }).catch(error => {
                console.log(error);
            })
    }, [API_URL]);

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
    }, [getBoards, getUsers]);

    const handleChange = (e) => {
        setNewBoard({ ...newBoard, [e.target.name]: e.target.value });
    }

    const handleAddBoard = async (e) => {
        e.preventDefault();
        if (!newBoard.name) {
            setAlert({ show: true, message: 'Hãy nhập tên bảng', title: 'Lỗi' });
            return;
        }
        try {
            await axios.post(`${API_URL}/boards`, {
                name: newBoard.name,
                description: newBoard.description,
                owner: user.uid
            });
            await getBoards();
            setNewBoard({ name: '', description: '' });
            setShowModal(false);

        } catch (error) {
            console.log("Lỗi:", error);
        }
    }

    const handleGetRepo = () => {
        if (repoInput.owner && repoInput.repo) {
            getRepoData(repoInput.owner, repoInput.repo);
        } else {
            setAlert({ show: true, message: 'Hãy nhập thông tin người dùng', title: 'Lỗi' });
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

    const handleCloseAlert = () => {
        setAlert({ show: false, message: '', title: '' });
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
                                <Boards key={item.id} board={item} users={users} />
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
                        <Form.Control as="input" className="mb-2" value={newBoard.name} name="name"
                            onChange={handleChange} />

                        <Form.Label>
                            Nhập mô tả của bảng
                        </Form.Label>
                        <Form.Control as="textarea" className="mb-2" value={newBoard.description} name="description"
                            onChange={handleChange} />
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
                                <h5><i className="bi bi-github"></i> Repo: {repoData.repositoryId}</h5>
                                <hr />

                                <h6 className="fw-bold text-primary">Branches ({repoData.branches?.length})</h6>
                                <Table striped bordered hover size="sm" className="mb-4">
                                    <thead>
                                        <tr>
                                            <th>Tên Nhánh</th>
                                            <th>Last Commit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repoData.branches?.map((b, index) => (
                                            <tr key={index}>
                                                <td><code>{b.name}</code></td>
                                                <td className="text-muted small">{b.lastCommitSha.substring(0, 7)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <h6 className="fw-bold text-success">Recent Commits</h6>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Commit</th>
                                            <th>SHA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repoData.commits?.map((c, index) => (
                                            <tr key={index}>
                                                <td className="text-truncate" style={{ maxWidth: '300px' }}>{c.message}</td>
                                                <td><Badge bg="secondary">{c.sha.substring(0, 7)}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                            </div>
                        )
                    }
                </Modal.Body>
            </Modal>

            <AlertModal alertObj={alert} closeAlert={handleCloseAlert} />
        </>
    );
}

export default Dashboard;