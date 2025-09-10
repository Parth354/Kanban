import React, { useState, useEffect } from "react";
import Card from "./Card";
import axios from "axios";

const API_URL = "http://localhost:3000/api/cards";

function Column({ column, boardId }) {
  const [cards, setCards] = useState([]);
  const [cardTitle, setCardTitle] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const res = await axios.get(`${API_URL}/${column.id}`);
    setCards(res.data);
  };

  const addCard = async () => {
    if (!cardTitle) return;
    const res = await axios.post(API_URL, { columnId: column.id, title: cardTitle, position: cards.length + 1 });
    setCards([...cards, res.data]);
    setCardTitle("");
  };

  return (
    <div className="w-64 bg-gray-100 p-2 rounded flex-shrink-0">
      <h2 className="font-bold mb-2">{column.title}</h2>
      <div className="space-y-2 mb-2">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
      <input
        type="text"
        placeholder="New card title"
        value={cardTitle}
        onChange={(e) => setCardTitle(e.target.value)}
        className="border p-1 w-full mb-1 rounded"
      />
      <button onClick={addCard} className="bg-green-500 text-white px-2 py-1 rounded w-full">
        Add Card
      </button>
    </div>
  );
}

export default Column;
