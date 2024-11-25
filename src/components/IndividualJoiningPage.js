import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { zoomies } from "ldrs";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

zoomies.register();

const IndividualJoiningPage = () => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [noidError, setNoidError] = useState(false);
  const [subError, setSubError] = useState(false);
  const [idArr, setIDArr] = useState([]);

  const mode = searchParams.get("mode");

  function handleStart() {
    navigate(
      `/game/${id?.split("_")[0]}?name=${name}&mode=${id?.split("_")[1]}`
    );
  }

  function handleBack() {
    navigate(`/`);
  }

  function show() {
    console.log(searchParams.get("mode"));
  }

  async function fetchGameIDs() {
    try {
      // Reference the "games" node in the database
      const gamesRef = ref(db, "games");

      // Fetch the data snapshot
      const snapshot = await get(gamesRef);

      // Check if the snapshot exists
      if (snapshot.exists()) {
        // Extract the keys (IDs) from the snapshot
        const gameIDs = Object.keys(snapshot.val());
        console.log("Game IDs:", gameIDs);
        setIDArr(gameIDs);
        return gameIDs; // Returns an array of IDs
      } else {
        console.log("No games found in the database.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching game IDs:", error);
    }
  }

  useEffect(() => {
    fetchGameIDs();
  }, []);

  return (
    <>
      {loading ? (
        <div className="w-full h-[100svh] flex justify-center items-center flex-col">
          <span className="font-[interSemibold] text-[24px] h-[50px] mt-[-50px]">
            Joining
          </span>
          <l-zoomies
            size="140"
            stroke="5"
            bg-opacity="0.1"
            speed="1.4"
            color="#0F172A"
          ></l-zoomies>
          <span className="font-[interRegular] text-[15px] h-[50px] pt-[13px] mb-[-50px] text-center px-[20px]">
            Please be patient while we establish the connection with server
          </span>
        </div>
      ) : noidError ? (
        <div className="w-full h-[100svh] flex justify-center items-center flex-col">
          <span className="font-[interSemibold] text-[24px] h-[50px] mt-[-50px]">
            {subError ? <>Oops</> : <>Error</>}
          </span>
          <l-zoomies
            size="140"
            stroke="5"
            bg-opacity="0.1"
            speed="1.4"
            color="#0F172A"
          ></l-zoomies>
          <span className="font-[interRegular] text-[15px] h-[50px] pt-[13px] mb-[-50px] text-center px-[20px]">
            {subError ? (
              <>Entered ID is invalid, please enter a valid ID</>
            ) : (
              <>
                Please be patient we are trying to make a connection to the
                server
              </>
            )}
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
          <div className="text-[13px] w-[300px] flex justify-start items-center pl-[10px] mb-[-10px] z-10 mt-[10px]">
            <div className="px-[5px] text-[#646464] bg-white">Game ID</div>
          </div>
          <input
            className={
              "w-[300px] h-[43px] border  rounded-lg px-[15px] outline-none" +
              (error ? " border-[#e04c27]" : " border-[#dde4ec]")
            }
            type="text"
            placeholder="Enter ID"
            value={id}
            onChange={(e) => {
              setError(false);
              setId(e.target.value);
            }}
          />
          <div
            className={
              "mt-[20px] flex justify-center items-center w-[300px] h-[43px] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer text-white" +
              (name.length > 0 && id.length > 0
                ? " bg-[#0F172A]"
                : " bg-[#878B94]")
            }
            onClick={() => {
              if (name.length > 0 && id.length > 0) {
                if (!id.includes("_")) {
                  setError(true);
                } else if (id?.split("_")[1].length != 1) {
                  setError(true);
                } else {
                  if (idArr.includes(id?.split("_")[0])) {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      handleStart();
                    }, 3000);
                  } else {
                    setNoidError(true);
                    setTimeout(() => {
                      setSubError(true);
                    }, 1500);
                    setTimeout(() => {
                      setNoidError(false);
                      setSubError(false);
                    }, 4000);
                  }
                }
              }
            }}
          >
            Join Game
          </div>{" "}
          <div className="w-[100px] flex justify-center items-center my-[20px] h-0 overflow-visible border border-[#15203a3b]">
            <div className="h-[20px] flex text-[14px] justify-center items-center bg-white px-[8px]">
              OR
            </div>
          </div>
          <div
            className={
              "mt-[0px] flex justify-center items-center w-[300px] h-[43px] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer text-white  bg-[#0F172A]"
            }
            onClick={() => {
              handleBack();
            }}
          >
            Start a new game
          </div>
        </div>
      )}
    </>
  );
};

export default IndividualJoiningPage;
