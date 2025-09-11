import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:3000/api/boards";

function BoardList() {
  const { accessToken, user } = useContext(AuthContext);
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (accessToken) {
      fetchBoards();
    }
  }, [accessToken]);

  const fetchBoards = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setBoards(res.data);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  const createBoard = async () => {
    if (!title) return;
    try {
      const res = await axios.post(
        API_URL,
        { title },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setBoards([...boards, res.data]);
      setTitle("");
    } catch (err) {
      console.error("Error creating board:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New board title"
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={createBoard}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Board
        </button>
      </div>
      <div className="grid gap-2">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="p-2 border rounded hover:bg-gray-100"
          >
            {board.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BoardList;
