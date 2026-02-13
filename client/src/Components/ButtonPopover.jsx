import React from "react";
import { Button, Popover } from "react-bootstrap";

const ButtonPopover = React.forwardRef(({ setModalInfo, setModalDelete, infoTitle, deleteTitle, ...props }, ref) => {
    return (
        <Popover ref={ref} {...props}>
            <Popover.Body className="p-2">
                <div className="d-grid">
                    <Button
                        variant="info"
                        className="mb-2 text-white"
                        onClick={() => {
                            setModalInfo(true);
                            document.body.click(); 
                        }}
                    >
                        {infoTitle}
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => {
                            setModalDelete(true);
                            document.body.click(); 
                        }}
                    >
                        {deleteTitle}
                    </Button>
                </div>
            </Popover.Body>
        </Popover>
    );
});

export default ButtonPopover;