import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Column from "./Column";
import axios from "axios";

const API_URL = "http://localhost:3000/api/columns";

function Board() {
  const { id } = useParams();
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    const res = await axios.get(`${API_URL}/${id}`);
    setColumns(res.data);
  };

  return (
    <div className="p-4 flex space-x-4 overflow-x-auto">
      {columns.map((col) => (
        <Column key={col.id} column={col} boardId={id} />
      ))}
    </div>
  );
}

export default Board;
