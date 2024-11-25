import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import GamePage from "./components/GamePage";
import JoiningPage from "./components/JoiningPage";
import IndividualJoiningPage from "./components/IndividualJoiningPage";

function App() {
  return (
    <div className="w-full h-[100svh] flex justify-center items-center flex-col select-none">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game/join" element={<IndividualJoiningPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/joinGame/:gameId" element={<JoiningPage />} />
        </Routes>
      </Router>
    </div>
    // <>
    //   <div className="w-full text-[red]">sdgS</div>
    // </>
  );
}

export default App;
