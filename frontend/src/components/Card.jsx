import React from "react";

function Card({ card }) {
  return (
    <div className="p-2 bg-white rounded shadow cursor-pointer">
      <h3 className="font-semibold">{card.title}</h3>
      <p className="text-sm">{card.description}</p>
    </div>
  );
}

export default Card;
