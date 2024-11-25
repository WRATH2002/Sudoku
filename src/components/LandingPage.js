import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { ref, set, onValue } from "firebase/database";
import { zoomies } from "ldrs";

zoomies.register();

// Default values shown

const LandingPage = () => {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("");
  const [gameId, setGameId] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleStart(tempData) {
    // const gameId = Date.now(); // Generate a unique game ID
    console.log("navigate");
    console.log(tempData);
    navigate(`/game/${tempData}?name=${name}&mode=${mode}`);
  }

  function handleMoveToJoin() {
    navigate(`/game/join`);
  }

  useEffect(() => {
    if (gameId !== 0) {
      fetchGameData();
    }
  }, [gameId]);

  const fetchGameData = async () => {
    console.log("fetch");
    console.log(gameId);
    fetch(`https://sudoku-api.vercel.app/api/dosuku?difficulty=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        const boardArray = data?.newboard?.grids[0]?.value || [];
        const solvedArray = data?.newboard?.grids[0]?.solution || [];
        const boardString = boardArray.flat().join(",");
        const solvedString = solvedArray.flat().join(",");

        // Save the board and solution as strings in Firebase
        set(ref(db, `games/${gameId}/board`), boardString);
        set(ref(db, `games/${gameId}/solvedBoard`), solvedString);
        set(ref(db, `games/${gameId}/currBoard`), boardString);
        set(ref(db, `games/${gameId}/mistakes`), 0);
        set(ref(db, `games/${gameId}/gameOver`), false);
        set(ref(db, `games/${gameId}/colorTheme`), true);
        set(ref(db, `games/${gameId}/considerMistakes`), true);
        set(ref(db, `games/${gameId}/gameEnd`), false);

        // // Update local state
        // setBoard(boardString);
        // setSolvedBoard(solvedString);
        // setCurrBoard(boardString);
      });
  };

  return (
    <>
      {loading ? (
        <div className="w-full h-[100svh] flex justify-center items-center flex-col">
          <span className="font-[interSemibold] text-[24px] h-[50px] mt-[-50px]">
            Loading
          </span>
          <l-zoomies
            size="140"
            stroke="5"
            bg-opacity="0.1"
            speed="1.4"
            color="#0F172A"
          ></l-zoomies>
          <span className="font-[interRegular] text-[15px] h-[50px] pt-[13px] mb-[-50px] text-center px-[20px]">
            Please wait while your game is being loaded
          </span>
        </div>
      ) : (
        <div className="font-[interRegular] w-full h-full  flex flex-col justify-center items-center">
          <div className=" text-[20px] tracking-wider mb-[10px] ml-[-40px] ">
            Realtime
          </div>
          <div className=" text-[40px] font-[interBold] tracking-tighter my-[-20px] ">
            Sudoku
          </div>
          <div className=" text-[14px] font-[interSemibold] mt-[5px] mr-[-120px]">
            Multiplayer
          </div>
          <div className="text-[13px] w-[300px] flex justify-start items-center pl-[10px] mb-[-10px] z-10 mt-[30px]">
            <div className="px-[5px] text-[#646464] bg-white">Name</div>
          </div>
          <input
            className="w-[300px] h-[43px] border border-[#dde4ec] rounded-lg px-[15px] outline-none"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div
            className={
              "mt-[30px] flex justify-center items-center w-[300px] h-[43px] border border-[#dde4ec] hover:bg-[#F1F5F9] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer" +
              (mode == "easy" ? " bg-[#F1F5F9]" : " bg-[white]")
            }
            type="text"
            placeholder="Enter your name"
            value={name}
            onClick={() => setMode("easy")}
          >
            Easy
          </div>
          <div
            className={
              "mt-[5px] flex justify-center items-center w-[300px] h-[43px] border border-[#dde4ec] hover:bg-[#F1F5F9] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer" +
              (mode == "medium" ? " bg-[#F1F5F9]" : " bg-[white]")
            }
            type="text"
            placeholder="Enter your name"
            value={name}
            onClick={() => setMode("medium")}
          >
            Medium
          </div>
          <div
            className={
              "mt-[5px] flex justify-center items-center w-[300px] h-[43px] border border-[#dde4ec] hover:bg-[#F1F5F9] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer" +
              (mode == "hard" ? " bg-[#F1F5F9]" : " bg-[white]")
            }
            type="text"
            placeholder="Enter your name"
            value={name}
            onClick={() => setMode("hard")}
          >
            Hard
          </div>
          <div
            className={
              "mt-[5px] flex justify-center items-center w-[300px] h-[43px] border border-[#dde4ec] hover:bg-[#F1F5F9] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer" +
              (mode == "insane" ? " bg-[#F1F5F9]" : " bg-[white]")
            }
            type="text"
            placeholder="Enter your name"
            value={name}
            onClick={() => setMode("insane")}
          >
            Insane
          </div>
          {/* <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select> */}
          <div
            className={
              "mt-[20px] flex justify-center items-center w-[300px] h-[43px] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer text-white" +
              (name.length > 0 && mode.length > 0
                ? " bg-[#0F172A]"
                : " bg-[#878B94]")
            }
            onClick={() => {
              if (name.length > 0 && mode.length > 0) {
                let temp = Date.now();
                setGameId(temp);
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  handleStart(temp);
                }, 3000);
              }
            }}
          >
            Start
          </div>
          <div className="w-[100px] flex justify-center items-center my-[20px] h-0 overflow-visible border border-[#15203a3b]">
            <div className="h-[20px] flex text-[14px] justify-center items-center bg-white px-[8px]">
              OR
            </div>
          </div>

          <div
            className={
              " flex justify-center items-center w-[300px] h-[43px] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer text-white bg-[#0F172A]"
            }
            onClick={() => {
              handleMoveToJoin();
            }}
          >
            Join
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
