import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BoardList from "./components/BoardList";
import Board from "./components/Board";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoardList />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default App;
