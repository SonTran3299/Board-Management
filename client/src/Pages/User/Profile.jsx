import { Alert, Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { getDatabase, ref, child, get, set, update } from "firebase/database";

import { useEffect, useState } from "react";
import { useAuth } from "../../Hooks/AuthContext";
import { database } from "../../../firebase";

const Profile = () => {
    const { user } = useAuth();
    const dbRef = ref(database);
    const [userInfo, setUserInfo] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', title: '' });

    useEffect(() => {
        get(child(dbRef, `users/${user.uid}`)).then(snapshot => {
            if (snapshot.exists()) {
                setUserInfo(snapshot.val());
            }
            else {
                console.log("Khong co du lieu");
                setAlert({ show: true, message: 'Không có dữ liệu', title: 'Lỗi' });
            };
        }).catch(error => {
            console.log(error);
            setAlert({ show: true, message: 'Có lỗi xảy ra', title: 'Lỗi' });
        })
    }, [user]);

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    }

    const handleUpdateInfo = () => {
        update(ref(database, `users/${user.uid}`), {
            name: userInfo.name
        }).then(() => {
            setAlert({ show: true, message: 'Thay đổi thông tin thành công', title: 'Thành công' });

        }).catch(error => {
            console.log(error);
        })
    }

    const handleClose=()=>{
        setAlert({ show: false, message: '', title: '' });
    }
    return (
        <>
            <Container className="mt-2">
                <Row>
                    <Col md="6">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Tên người dùng:
                                </Form.Label>
                                <Form.Control type="input" name="name" value={userInfo.name || ''}
                                    onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Email:
                                </Form.Label>
                                <Form.Control type="email" name="email" value={userInfo.email || ''}
                                    readOnly />
                            </Form.Group>
                        </Form>
                        <Button variant="primary" onClick={handleUpdateInfo}>Lưu lại</Button>
                    </Col>
                </Row>
            </Container>

            <Modal show={alert.show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{alert.title}</Modal.Title>     
                </Modal.Header>
                <Modal.Body>
                    {alert.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Profile;