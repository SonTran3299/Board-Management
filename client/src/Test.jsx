import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, Container, Row, Col } from 'react-bootstrap';

// Dữ liệu mẫu
const initialData = {
  columns: {
    'col-1': { id: 'col-1', title: 'Nhóm A', items: [{ id: '1', content: 'Card 1' }, { id: '2', content: 'Card 2' }] },
    'col-2': { id: 'col-2', title: 'Nhóm B', items: [{ id: '3', content: 'Card 3' }] }
  }
};

const DragDropApp = () => {
  const [data, setData] = useState(initialData);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // Nếu thả ra ngoài vùng cho phép

    // Logic di chuyển item giữa các mảng (cột)
    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];
    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];
    
    const [removed] = sourceItems.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, removed);
      setData({ ...data, columns: { ...data.columns, [sourceCol.id]: { ...sourceCol, items: sourceItems } } });
    } else {
      destItems.splice(destination.index, 0, removed);
      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceCol.id]: { ...sourceCol, items: sourceItems },
          [destCol.id]: { ...destCol, items: destItems }
        }
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container fluid className="mt-4">
        <Row>
          {Object.values(data.columns).map((column) => (
            <Col key={column.id} md={4}>
              {/* CARD LỚN (DROPPABLE) */}
              <Card className="bg-light shadow-sm" style={{ minHeight: '500px' }}>
                <Card.Header className="fw-bold">{column.title}</Card.Header>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <Card.Body {...provided.droppableProps} ref={provided.innerRef}>
                      {column.items.map((item, index) => (
                        /* CARD NHỎ (DRAGGABLE) */
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2 shadow-sm"
                            >
                              <Card.Body>{item.content}</Card.Body>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Card.Body>
                  )}
                </Droppable>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </DragDropContext>
  );
};

export default DragDropApp;