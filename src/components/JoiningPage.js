import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { zoomies } from "ldrs";

zoomies.register();

const JoiningPage = () => {
  const [name, setName] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const mode = searchParams.get("mode");

  function handleStart() {
    // const gameId = Date.now(); // Generate a unique game ID
    console.log("navigate");
    console.log();
    navigate(
      `/game/${searchParams.get("roomId")}?name=${name}&mode=${searchParams.get(
        "mode"
      )}`
    );
  }

  function show() {
    console.log(searchParams.get("mode"));
  }

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
              "mt-[20px] flex justify-center items-center w-[300px] h-[43px] rounded-lg px-[15px] outline-none font-[interSemibold] cursor-pointer text-white" +
              (name.length > 0 ? " bg-[#0F172A]" : " bg-[#878B94]")
            }
            onClick={() => {
              //   let temp = Date.now();
              //   setGameId(temp);
              //   setLoading(true);
              //   setTimeout(() => {
              //     setLoading(false);
              //     handleStart(temp);
              //   }, 3000);
              if (name.length > 0) {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  handleStart();
                }, 3000);
              }
            }}
          >
            Join Game
          </div>
        </div>
      )}
    </>
  );
};
export default JoiningPage;
