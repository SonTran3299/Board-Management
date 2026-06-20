import { Badge, Button, Col, Container, Form, Modal, Offcanvas, Row, Table } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Hooks/AuthContext";
import AlertModal from "../../Components/AlertModal";
import { useCallback } from "react";
import api from "../../function/api";
import Boards from "../../features/dashboard/components/Boards";
import AnimatedPage from "../../Components/AnimatedPage";
import DashboardPagination from "../../features/dashboard/components/DashboardPagination";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [boards, setBoards] = useState({ boards: [], totalPages: 0 });
    const [allBoards, setAllBoards] = useState([]);
    const [users, setUsers] = useState([]);
    const [newBoard, setNewBoard] = useState({ name: '', description: '' });
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);
    const [repoData, setRepoData] = useState(null);
    const [showModalRepo, setShowModalRepo] = useState(false);
    const [repoInput, setRepoInput] = useState({ owner: '', repo: '' });
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });

    const page = parseInt(searchParams.get('page')) || 1;

    const getBoards = useCallback(async () => {
        try {
            const res = await api.get(`${API_URL}/boards?page=${page}&limit=5`);
            setBoards(res.data);
        } catch (error) {
            setAlert({ show: true, message: 'Lỗi tải danh sách bảng', title: 'Có lỗi xảy ra' });
        }
    }, [API_URL, page]);

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

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
        api.get(`${API_URL}/boards/board-list`)
            .then(res => setAllBoards(res.data))
    }, []);

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

    const handleDeleteBoard = (boardId) => {
        setBoards(prev => ({
            ...prev,
            boards: prev.boards.filter(b => b.id !== boardId)
        }));

        setAllBoards(prev => prev.filter(b => b.id !== boardId));
    }

    const handleUpdateBoard = (updatedBoard) => {
        setBoards(prev => ({
            ...prev,
            boards: prev.boards.map(b => b.id === updatedBoard.id ? updatedBoard : b)
        }));

        setAllBoards(prev => prev.map(b => b.id === updatedBoard.id ? updatedBoard : b));
    };

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

    const handleJumpToBoard = (boardId) => {
        const index = allBoards.findIndex(b => b.id === boardId);
        if (index !== -1) {
            const limit = 5;
            const targetPage = Math.floor(index / limit) + 1;

            setSearchParams({ page: targetPage });

            setTimeout(() => {
                const e = document.getElementById(boardId);
                if (e) e.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
    return (
        <>
            <AnimatedPage>
                <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div className="bg-light border-end" style={{ width: '250px', overflowY: 'auto' }}>
                        <div className="p-3">
                            <h5 className="text-primary">Danh sách bảng</h5>
                            </div>
                        <div className="list-group list-group-flush">
                            {allBoards.map(b => (
                                <button
                                    key={b.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleJumpToBoard(b.id)}
                                >
                                    <i className="bi bi-layout-three-columns me-2"></i>
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow-1 d-flex flex-column vh-100 overflow-hidden bg-light">
                        <div className="flex-shrink-0 p-3 bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Button variant="secondary" onClick={() => setShowModal(true)}>
                                        <i className="bi bi-plus-lg"></i> Thêm bảng
                                    </Button>
                                </div>
                                <Button variant="primary" onClick={() => setShowModalRepo(true)}>
                                    <i className="bi bi-plus-lg"></i> Xem Repository
                                </Button>
                            </div>
                        </div>

                        <div className="flex-grow-1 overflow-y-auto p-3">
                            {
                                boards.boards && boards.boards.length > 0 ? (
                                    boards.boards.map(item => (
                                        <Boards
                                            key={item.id}
                                            board={item}
                                            users={users}
                                            onDeleteBoard={handleDeleteBoard}
                                            onUpdateSuccess={handleUpdateBoard}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center mt-5">Không có bảng.</p>
                                )
                            }
                        </div>

                        <div className="flex-shrink-0 pt-2 px-4 border-top bg-white d-flex justify-content-end">
                            <DashboardPagination
                                totalPages={boards.totalPages}
                                currentPage={page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </AnimatedPage>

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