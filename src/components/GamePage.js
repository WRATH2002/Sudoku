import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { ref, set, onValue } from "firebase/database";
import {
  CirclePlay,
  Eraser,
  Files,
  Forward,
  Link,
  Play,
  Settings,
  Timer,
  User,
  Users,
} from "lucide-react";
import QRCode from "react-qr-code";
import TxtShuffle from "txt-shuffle";
import { ring2 } from "ldrs";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

ring2.register();

// Default values shown

const side = [3, 6, 12, 15, 30, 33, 39, 42, 57, 60, 66, 69, 75, 78];

const bottom = [19, 20, 22, 23, 25, 26, 27, 46, 47, 49, 50, 52, 53, 54];

const common = [21, 24, 48, 51];

const num = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const GamePage = () => {
  const textRef = useRef();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState(false);
  const [currString, setCurrString] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [colorTheme, setColorTheme] = useState(false);
  const [countMistakes, setCountMistakes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expand, setExpand] = useState(false);
  const [easter, setEaster] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [idCopied, setIDCopied] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [currBoard, setCurrBoard] = useState(""); // Current game state
  const [time, setTime] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const [board, setBoard] = useState(""); // Original board for non-editable cells
  const [solvedBoard, setSolvedBoard] = useState(""); // Solved board for validation
  const [chat, setChat] = useState([]); // Chat messages
  const [message, setMessage] = useState("");

  const name = searchParams.get("name");
  const mode = searchParams.get("mode");

  const [selectedCell, setSelectedCell] = useState(-1);
  const [highlightCell, setHighlightCell] = useState(-1);

  function handleNavigateHome() {
    navigate(`/`);
  }

  const handleCelebrate = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts for 3 seconds
  };

  useEffect(() => {
    // Fetch Sudoku board and solution from API
    // fetch(`https://sudoku-api.vercel.app/api/dosuku?difficulty=${mode}`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     const boardArray = data?.newboard?.grids[0]?.value || [];
    //     const solvedArray = data?.newboard?.grids[0]?.solution || [];
    //     const boardString = boardArray.flat().join(",");
    //     const solvedString = solvedArray.flat().join(",");

    //     // Save the board and solution as strings in Firebase
    //     set(ref(db, `games/${gameId}/board`), boardString);
    //     set(ref(db, `games/${gameId}/solvedBoard`), solvedString);
    //     set(ref(db, `games/${gameId}/currBoard`), boardString);

    //     // Update local state
    //     setBoard(boardString);
    //     setSolvedBoard(solvedString);
    //     setCurrBoard(boardString);
    //   });

    // Listen for updates to the current board
    const currBoardRef = ref(db, `games/${gameId}/currBoard`);
    onValue(currBoardRef, (snapshot) => {
      const board = snapshot.val();
      if (board) {
        setCurrBoard(board);
        setCurrString(board.split(","));
      }
    });

    const boardRef = ref(db, `games/${gameId}/board`);
    onValue(boardRef, (snapshot) => {
      const boardd = snapshot.val();
      if (boardd) setBoard(boardd);
    });

    const solvedBoardRef = ref(db, `games/${gameId}/solvedBoard`);
    onValue(solvedBoardRef, (snapshot) => {
      const boarddd = snapshot.val();
      if (boarddd) setSolvedBoard(boarddd);
    });

    const mistakesRef = ref(db, `games/${gameId}/mistakes`);
    onValue(mistakesRef, (snapshot) => {
      const boardddd = snapshot.val();
      setMistakes(boardddd);
    });

    const gameRef = ref(db, `games/${gameId}/gameOver`);
    onValue(gameRef, (snapshot) => {
      const ove = snapshot.val();
      setGameOver(ove);
    });

    // Listen for chat updates
    const chatRef = ref(db, `games/${gameId}/chat`);
    onValue(chatRef, (snapshot) => {
      const messages = snapshot.val() || [];
      setChat(messages);
    });

    const themeRef = ref(db, `games/${gameId}/colorTheme`);
    onValue(themeRef, (snapshot) => {
      const theme = snapshot.val();
      setColorTheme(theme);
    });

    const misRef = ref(db, `games/${gameId}/considerMistakes`);
    onValue(misRef, (snapshot) => {
      const mis = snapshot.val();
      setCountMistakes(mis);
    });

    const endRef = ref(db, `games/${gameId}/gameEnd`);
    onValue(endRef, (snapshot) => {
      const end = snapshot.val();
      setGameEnd(end);
    });

    const timeRef = ref(db, `games/${gameId}/creationTime`);
    onValue(timeRef, (snapshot) => {
      const ti = snapshot.val();
      setTime(ti);
    });
  }, [gameId, mode]);

  // Function to update a cell in the current board
  const updateCell = (data) => {
    let tempStr = currBoard.replaceAll(",", "");
    let afterStr =
      tempStr.slice(0, selectedCell) + data + tempStr.slice(selectedCell + 1);

    console.log(solvedBoard.split(",")[selectedCell]);
    console.log(data);

    if (solvedBoard.split(",")[selectedCell] != data) {
      console.log("mistake");
      if (countMistakes) {
        updateMistakeCount();
      }
    } else {
      console.log("right");
    }

    if (solvedBoard === afterStr.split("").join(",")) {
      set(ref(db, `games/${gameId}/gameEnd`), true);
      handleCelebrate();
      setSelectedCell(-1);
    }
    set(ref(db, `games/${gameId}/currBoard`), afterStr.split("").join(","));
  };

  const updateMistakeCount = () => {
    if (mistakes + 1 >= 3) {
      set(ref(db, `games/${gameId}/gameOver`), true);
    }
    set(ref(db, `games/${gameId}/mistakes`), mistakes + 1);
  };

  const updateTheme = () => {
    set(ref(db, `games/${gameId}/colorTheme`), !colorTheme);
  };

  const updateConsiderMistakes = () => {
    set(ref(db, `games/${gameId}/considerMistakes`), !countMistakes);
  };

  const makeMistakeZero = () => {
    set(ref(db, `games/${gameId}/gameOver`), false);
    // setGameOver(false);

    set(ref(db, `games/${gameId}/mistakes`), 0);
  };

  // Function to send a message
  const sendMessage = () => {
    if (!message.trim()) return;

    const chatRef = ref(db, `games/${gameId}/chat`);
    const newMessage = { name, text: message.trim(), timestamp: Date.now() };

    // Update the chat in Firebase
    set(chatRef, [...chat, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    // setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(
        `https://sudokuio.vercel.app/joinGame/join?roomId=${gameId}&mode=${mode}`
      )
      .then(() => {
        // alert("Text copied to clipboard!");
        setLinkCopied(true);
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleCopyID = () => {
    let data = gameId + "_" + mode?.charAt(0)?.toUpperCase();
    navigator.clipboard
      .writeText(data)
      .then(() => {
        // alert("Text copied to clipboard!");
        setIDCopied(true);
        setTimeout(() => {
          setIDCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    // Function to calculate elapsed time
    function calculateElapsedTime() {
      if (time == undefined || time.length == 0) {
        return "00:00:00";
      } else {
        const now = new Date();
        const createdAt = new Date(time);

        const elapsedMilliseconds = now - createdAt;

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor(
          (elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);

        // Format as hh:mm:ss
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`;
      }
    }

    // Initial calculation
    setElapsedTime(calculateElapsedTime());

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedTime());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [time]);

  return (
    <>
      {loading ? (
        <div className="w-full h-[100svh] flex justify-center items-center">
          <l-ring-2
            size="40"
            stroke="5"
            stroke-length="0.25"
            bg-opacity="0.1"
            speed="0.8"
            color="black"
          ></l-ring-2>
        </div>
      ) : (
        <>
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={300}
              recycle={false} // Ensures it doesn't loop infinitely
            />
          )}
          {/* <div
            className="w-[79%] md:w-[300px] lg:w-[300px] flex flex-col justify-center items-center bg-white fixed left-[50%] top-[50%] boxShadowLight2 rounded-xl p-[30px] py-[25px] font-[interRegular]"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="font-[interBold] text-[23px]">
              Sudoku Multiplayer
            </div>
            <div className=" text-[15px] mt-[-2px]">v 1.0.04</div>{" "}
          
            <div className="font-[interSemibold] text-[19px] mt-[15px]">
              By, Himadri Purkait
            </div>
          </div> */}
          <div
            className={
              "font-[interRegular] fixed w-full min-h-[100dvh] z-30 flex justify-center items-center left-0 top-0 bg-[#0000006e]" +
              (expand
                ? " flex md:hidden lg:hidden"
                : " hidden md:hidden lg:hidden")
            }
          >
            <div className="w-full p-[30px] py-[25px] bg-[white] flex flex-col justify-center items-center h-auto">
              <div className="text-[20px] font-[interBold] w-[75%] flex justify-center items-center">
                Share with your friends
              </div>
              <div
                className="font-[interSemibold]  w-[65%] flex justify-center items-center h-[40px] border border-[#dde4ec] rounded-lg hover:bg-[#E2E3E5] mt-[20px]"
                onClick={() => {
                  handleCopyLink();
                }}
              >
                <Link
                  width={16}
                  height={16}
                  strokeWidth={2.4}
                  className="mr-[7px]"
                />
                Copy Link
              </div>
              <div className=" w-[75%] flex justify-center items-center text-[#64748B] my-[10px]">
                Share link to play together
              </div>
              <div className=" w-[65%] flex justify-center items-center">
                <QRCode
                  size={256}
                  style={{
                    height: "auto",
                    maxWidth: "100%",
                    width: "100%",
                  }}
                  value={`https://sudokuio.vercel.app/joinGame/join?roomId=${gameId}&mode=${mode}`}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <div className=" w-[75%] flex justify-center items-center text-[#64748B] my-[10px]">
                Scan qr code to join game
              </div>
              <div
                className=" w-[65%] flex justify-center items-center bg-[#0F172A]  rounded-lg text-white font-[interSemibold] h-[40px] mt-[0px]"
                onClick={() => {
                  setExpand(false);
                }}
              >
                Close
              </div>
            </div>
          </div>
          <div
            className={
              "fixed  h-[35px] rounded-[10px] bottom-0 left-[50%] bg-[#0F172A] text-white flex justify-center items-center boxShadowLight border border-[#0F172A] overflow-hidden whitespace-nowrap" +
              (linkCopied
                ? " opacity-100 mb-[15px] w-[120px]"
                : " opacity-0 mb-[-65px] w-[50px]")
            }
            style={{ transform: "translateX(-50%)", transition: ".4s" }}
          >
            Link Copied
          </div>
          <div
            className={
              "fixed  h-[35px] rounded-[10px] bottom-0 left-[50%] bg-[#0F172A] text-white flex justify-center items-center boxShadowLight border border-[#0F172A] overflow-hidden whitespace-nowrap" +
              (idCopied
                ? " opacity-100 mb-[15px] w-[120px]"
                : " opacity-0 mb-[-65px] w-[50px]")
            }
            style={{ transform: "translateX(-50%)", transition: ".4s" }}
          >
            ID Copied
          </div>
          <div className="w-full h-[100svh] md:h-[100svh] lg:h-[100svh] font-[IinterRegular] flex flex-col justify-center items-center p-[10px] py-[0px] md:py-[60px] lg:py-[60px]">
            {/* <h2>Game ID: {gameId}</h2>
      <h3>Player: {name}</h3> */}
            <div className="w-full md:w-full lg:w-[70%] h-full  border-[0px] md:border-[1.5px] lg:border-[1.5px] border-[#dde4ec] rounded-[0px] md:rounded-2xl lg:rounded-2xl p-[0px] py-[0px] md:p-[20px] md:py-[0px] lg:p-[20px] lg:py-[0px] flex flex-col justify-start items-center text-[#64748B] ">
              <div className="w-full flex justify-between items-center min-h-[60px] h-[60px] border-b-[1.5px] border-[#dde4ec]">
                <div className="flex justify-start items-center w-[100px]">
                  <Timer
                    className="text-[#000000] mr-[7px]"
                    width={23}
                    height={23}
                    strokeWidth={2}
                  />
                  {/* 00:00:27 */}
                  {elapsedTime}
                </div>
                {countMistakes ? (
                  <div className="flex justify-start items-center">
                    Mistakes{" "}
                    <div className="ml-[7px] flex justify-center items-center text-black">
                      {mistakes}/3
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <div className="w-[100px] h-full flex flex-col justify-start items-end overflow-y-visible cursor-pointer">
                  <div className="min-h-full flex justify-center items-center">
                    {" "}
                    <Settings
                      width={23}
                      height={23}
                      strokeWidth={2}
                      className="text-black"
                      onClick={() => {
                        setSettings(!settings);
                      }}
                    />
                  </div>

                  {settings ? (
                    <div className="w-[300px] h-auto z-20 rounded-xl border p-[15px] px-[20px] bg-white text-black flex flex-col items-start justify-start font-[interRegular] boxShadowLight2 mt-[10px] border-b-[1.5px] border-[#dde4ec]">
                      <span className="text-[23px] font-[interBold]">
                        Game Settings
                      </span>
                      <span className="text-[14px] leading-4">
                        These settings affect all players in this room
                      </span>
                      <div className="w-full  border-b-[1px] border-[#dde4ec] mt-[15px]"></div>
                      <span className="text-[16px] mt-[13px] mb-[2px] font-[interSemibold]">
                        Check Entries
                      </span>
                      <div className="flex w-full justify-between items-start">
                        <div className="w-[calc(100%-43px)] text-[14px] mr-[10px] leading-4 ">
                          Marks numbers in red (incorrect) or blue (correct).
                        </div>
                        <div
                          className={
                            "w-[33px] h-[22px] rounded-full  flex justify-start items-center px-[2px]  shadow-inner" +
                            (colorTheme ? " bg-[#41a921a4]" : " bg-[#E2E8F0]")
                          }
                          style={{ transition: ".3s" }}
                          onClick={() => {
                            // setColorTheme(!colorTheme);
                            updateTheme();
                            // DueReminderShowFirebaseUpdate();
                          }}
                        >
                          <div
                            className={
                              "w-[16px] aspect-square rounded-full drop-shadow-md " +
                              (colorTheme ? ` ml-[11px]` : " ml-0")
                            }
                            style={{
                              transition: ".3s",
                              backgroundColor: colorTheme
                                ? `#ffffff `
                                : " #ffffff",
                            }}
                          ></div>
                        </div>
                      </div>

                      <span className="text-[16px] mt-[13px] mb-[2px] font-[interSemibold]">
                        Consider Mistakes
                      </span>
                      <div className="flex w-full justify-between items-start">
                        <div className="w-[calc(100%-43px)] text-[14px] mr-[10px] leading-4 ">
                          You gets 3 chances for mistake else your game is over.
                        </div>
                        <div
                          className={
                            "w-[33px] h-[22px] rounded-full  flex justify-start items-center px-[2px]  shadow-inner" +
                            (countMistakes
                              ? " bg-[#41a921a4]"
                              : " bg-[#E2E8F0]")
                          }
                          style={{ transition: ".3s" }}
                          onClick={() => {
                            updateConsiderMistakes();
                          }}
                        >
                          <div
                            className={
                              "w-[16px] aspect-square rounded-full drop-shadow-md " +
                              (countMistakes ? ` ml-[11px]` : " ml-0")
                            }
                            style={{
                              transition: ".3s",
                              backgroundColor: countMistakes
                                ? `#ffffff `
                                : " #ffffff",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="w-full flex md:flex lg:hidden flex-col justify-start items-start">
                        <span className="text-[16px] mt-[15px] mb-[2px] font-[interSemibold]">
                          Play Multiplayer
                        </span>
                        <span className="text-[14px] leading-4">
                          To play with your friends together copy and share the
                          link or scan the QR Code.
                        </span>
                        <div className="w-full flex justify-between items-center mt-[15px]">
                          <div className="w-[calc((100%-15px)/2)]">
                            <QRCode
                              size={256}
                              style={{
                                height: "auto",
                                maxWidth: "100%",
                                width: "100%",
                              }}
                              value={`https://sudokuio.vercel.app/joinGame/join?roomId=${gameId}&mode=${mode}`}
                              viewBox={`0 0 256 256`}
                            />
                          </div>
                          <div className="w-[calc((100%-15px)/2)] aspect-square flex justify-center items-center ">
                            <div
                              className="w-full rounded-lg flex justify-center items-center h-[40px] bg-[#F1F5F9] text-[14px] font-[interSemibold] hover:bg-[#E2E3E5]"
                              onClick={() => {
                                handleCopyLink();
                              }}
                            >
                              <Link
                                width={16}
                                height={16}
                                strokeWidth={2.4}
                                className="mr-[7px]"
                              />
                              Copy Link
                            </div>
                          </div>
                        </div>
                      </div>

                      <span className="text-[16px] mt-[13px] mb-[2px] font-[interSemibold] flex justify-start items-center">
                        Game ID
                      </span>
                      <span
                        className="text-[14px] flex justify-start items-center leading-4"
                        onClick={() => {
                          handleCopyID();
                        }}
                      >
                        {gameId}_{mode?.charAt(0)?.toUpperCase()}{" "}
                        <Files
                          width={16}
                          height={16}
                          strokeWidth={2.4}
                          className="ml-[10px]"
                          // onClick={() => {
                          //   handleCopyID();
                          // }}
                        />
                      </span>

                      <span
                        className="w-full text-[16px] mt-[30px] mb-[2px] font-[interSemibold] flex justify-end items-center"
                        onClick={() => {
                          setEaster(true);
                        }}
                      >
                        version: &nbsp; 1.0.04
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                  {/* Game ID : <span className="ml-[7px] text-[black]"></span> */}
                </div>
              </div>
              <div className="w-full flex flex-col md:flex-row lg:flex-row justify-center items-center mt-[20px]">
                <div className="h-[555px] w-[140px] p-[15px] border-[1.5px] border-[#dde4ec] rounded-lg mr-[20px] hidden md:hidden lg:flex flex-col justify-start items-start">
                  <span className="text-[14px]">
                    Share with friends to play together
                  </span>
                  <div
                    className="w-full h-[40px] mt-[10px] rounded-lg  border-[1.5px] border-[#ecf0f5] flex justify-center items-center text-[14px] text-black font-[IinterSemibold] hover:bg-[#F1F5F9] cursor-pointer"
                    onClick={() => {
                      handleCopyLink();
                      // console.log(searchParams.get("mode"));
                      // console.log(new URL(url));
                    }}
                  >
                    <Link
                      width={16}
                      height={16}
                      strokeWidth={2.4}
                      className="mr-[7px]"
                    />
                    Copy Link
                  </div>
                  <span className="text-[14px] mt-[15px]">
                    Or scan this QR Code to join the game
                  </span>
                  <div className="w-full aspect-square mt-[15px]">
                    <QRCode
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      value={`https://sudokuio.vercel.app/joinGame/join?roomId=${gameId}&mode=${mode}`}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </div>
                <div className="w-full md:w-[495px] lg:w-[495px] flex flex-col justify-start items-center">
                  {gameOver ? (
                    <>
                      <div className="aspect-square w-full flex flex-col justify-center items-center border-[1px] border-[#b1bbc8] bg-[#F1F5F9] font-[interRegular] text-[black]">
                        <div
                          className="uppercase text-[32px] font-[interBold]"
                          // onClick={() => shuffleText()}
                          // ref={textRef}
                        >
                          GAME OVER
                        </div>
                        {/* <span class="w-[100px] h-[40px] text-[19px]">
                    <span class="animate-ping  inline-flex h-full w-full rounded-lg bg-[#0F172A] opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-[#0F172A]">
                      Retry
                    </span>
                  </span> */}
                        <div
                          className="w-[100px] h-[40px] text-[16px] bg-[#0F172A] flex justify-center items-center rounded-lg text-white mt-[20px] cursor-pointer"
                          onClick={() => makeMistakeZero()}
                        >
                          Retry
                        </div>
                        <div
                          className="w-[100px] h-[40px] text-[16px]  flex justify-center items-center rounded-lg  mt-[10px] cursor-pointer"
                          onClick={() => handleNavigateHome()}
                        >
                          New Game
                        </div>
                      </div>
                    </>
                  ) : gameEnd ? (
                    <>
                      <div className="aspect-square w-full flex flex-col justify-center items-center border-[1px] border-[#b1bbc8] bg-[#F1F5F9] font-[interRegular] text-[black]">
                        <div
                          className="uppercase text-[32px] font-[interBold]"
                          // onClick={() => shuffleText()}
                          // ref={textRef}
                        >
                          HURRAY !!
                        </div>
                        {/* <span class="w-[100px] h-[40px] text-[19px]">
                    <span class="animate-ping  inline-flex h-full w-full rounded-lg bg-[#0F172A] opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-[#0F172A]">
                      Retry
                    </span>
                  </span> */}
                        <div
                          className="w-[80%] h-[40px] text-[14px] leading-4 text-center  flex justify-center items-center rounded-lg text-black mt-[20px] cursor-pointer"
                          // onClick={() => makeMistakeZero()}
                        >
                          You have solved the {mode} level Sudoku challenge, a
                          Big Congratulations to you 🎉.
                        </div>
                        <div
                          className="w-[100px] h-[40px] text-[16px]  flex justify-center items-center rounded-lg  mt-[10px] cursor-pointer text-white bg-[#0F172A]"
                          onClick={() => handleNavigateHome()}
                        >
                          New Game
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square w-full flex flex-wrap justify-start items-start border-[1.7px] md:border-[2px] lg:border-[2px] border-[#BDCBDD]">
                      {currBoard?.split(",")?.map((data, index) => {
                        return (
                          <div
                            className={
                              "w-[calc(100%/9)] md:w-[calc(100%/9)] lg:w-[calc(100%/9)] text-[20px] aspect-square flex justify-center items-center " +
                              (board?.split(",")[index] == "0"
                                ? selectedCell == index
                                  ? " bg-[#d7e3fb]"
                                  : highlightCell == data
                                  ? " bg-[#E2E3E5]"
                                  : " bg-[#ffffff]"
                                : highlightCell == data
                                ? " bg-[#E2E3E5]"
                                : " bg-[#F6F6F7]") +
                              (board?.split(",")[index] == "0"
                                ? solvedBoard?.split(",")[index] == data
                                  ? colorTheme
                                    ? " text-[#2563EB]"
                                    : " text-black"
                                  : colorTheme
                                  ? " text-[#DC2626]"
                                  : " text-black"
                                : " text-[black]")
                            }
                            onClick={() => {
                              if (selectedCell == index) {
                                setSelectedCell(-1);
                              } else {
                                if (board?.split(",")[index] == "0") {
                                  setSelectedCell(index);
                                } else {
                                  setSelectedCell(-1);
                                }
                              }

                              if (data == "0") {
                                setHighlightCell(-1);
                              } else {
                                setHighlightCell(data);
                              }
                            }}
                          >
                            <div
                              className={
                                "w-full h-full flex justify-center items-center border-[.5px] md:border-[.5px] lg:border-[.5px] border-[#BDCBDD]" +
                                (common.includes(index + 1)
                                  ? " border-r-[1.7px] border-b-[1.7px] md:border-r-[2px] md:border-b-[2px] lg:border-r-[2px] lg:border-b-[2px] border-[#BDCBDD]"
                                  : bottom.includes(index + 1)
                                  ? " border-r-[.5px] border-b-[1.7px] md:border-r-[.5px] md:border-b-[2px] lg:border-r-[.5px] lg:border-b-[2px] border-[#BDCBDD]"
                                  : side.includes(index + 1)
                                  ? " border-r-[1.7px] border-b-[.5px] md:border-r-[2px] md:border-b-[.5px] lg:border-r-[2px] lg:border-b-[.5px] border-[#BDCBDD]"
                                  : " border-r-[.5px] border-b-[.5px] md:border-r-[.5px] md:border-b-[.5px] lg:border-r-[.5px] lg:border-b-[.5px] border-[#BDCBDD]")
                              }
                            >
                              {data == 0 ? <></> : <>{data}</>}
                            </div>
                            {/* {index} */}
                          </div>
                        );
                      })}

                      {/* <div className="w-[165px] h-[165px] border-b-[2px] border-r-[2px] border-[#b1bbc8] flex flex-wrap justify-center items-center">
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              //   <div className="w-[calc(100%/3)] aspect-square flex justify-center items-center border-[1px] border-[#dde4ec]"></div>
              // </div> */}
                    </div>
                  )}{" "}
                  <div className="w-full flex  text-black  justify-center items-center mt-[20px]">
                    {num?.map((data, index) => {
                      return (
                        <>
                          <div
                            className="w-[35px] md:w-[35px] lg:w-[35px] aspect-square flex justify-center items-center mx-[2px] md:mx-[5px] lg:mx-[5px] bg-[#F1F5F9] rounded-lg cursor-pointer hover:bg-[#E2E3E5]"
                            key={index}
                            onClick={() => {
                              if (selectedCell !== -1) {
                                console.log("updation called");
                                updateCell(data);
                              } else {
                                console.log("no updation");
                              }
                            }}
                          >
                            {data}
                          </div>
                        </>
                      );
                    })}
                    <div
                      className="w-[35px] aspect-square hidden md:flex lg:flex justify-center items-center mx-[5px] bg-[#F1F5F9] rounded-lg cursor-pointer hover:bg-[#E2E3E5]"
                      onClick={() => {
                        if (selectedCell !== -1) {
                          console.log("updation called");
                          updateCell(0);
                        } else {
                          console.log("no updation");
                        }
                      }}
                    >
                      <Eraser width={18} height={18} strokeWidth={2} />
                    </div>
                  </div>
                  <div
                    className="flex md:hidden lg:hidden justify-center items-center text-black w-[50px] h-[50px] mt-[15px] rounded-lg border border-[#F1F5F9] hover:bg-[#E2E3E5]"
                    onClick={() => {
                      if (selectedCell !== -1) {
                        console.log("updation called");
                        updateCell(0);
                      } else {
                        console.log("no updation");
                      }
                    }}
                  >
                    <Eraser width={24} height={24} strokeWidth={2} />
                  </div>
                </div>
                <div className="h-[555px] w-full md:w-[calc(100%-535px)] lg:w-[calc(100%-675px)] ml-[0px] md:ml-[20px] lg:ml-[20px] rounded-lg  border-[1.5px] border-[#ecf0f5] flex flex-col justify-start items-start overflow-hidden mt-[20px] md:mt-[0px] lg:mt-[0px] mb-[10px] md:mb-[0px] lg:mb-[0px] ">
                  <div className="w-full min-h-[50px] flex justify-between items-center border-b-[1.5px] border-[#ecf0f5] font-[interSemibold] text-[16px] pl-[15px] pr-[5px] text-black">
                    <div>In-Game Chat</div>
                    <div
                      className="bg-[#F1F5F9] hover:bg-[#E2E3E5] cursor-pointer px-[15px] h-[calc(100%-10px)] rounded-lg flex md:hidden lg:hidden justify-center items-center"
                      onClick={() => {
                        setExpand(!expand);
                      }}
                    >
                      <Users
                        width={16}
                        height={16}
                        strokeWidth={2.5}
                        className="mr-[7px]"
                      />{" "}
                      Invite
                    </div>
                  </div>
                  <div className="min-h-[calc(100%-105px)] border-none rounded-lg overflow-y-scroll w-full flex flex-col justify-start items-start p-[15px] chat-box">
                    {chat?.map((msg, index) => (
                      <div className="w-full flex justify-start items-start text-black mb-[10px]">
                        <div className="w-[25px] h-[25px] rounded-full bg-[#0F172A] mr-[10px] mt-[3px] flex justify-center items-center">
                          <User
                            width={16}
                            height={16}
                            strokeWidth={2.6}
                            className="text-white"
                          />
                        </div>
                        <div className="w-[calc(100%-35px)] flex flex-col justify-start items-start">
                          <span className="font-[IinterSemiBold] text-[15px]">
                            {msg.name}
                          </span>
                          <pre className="text-[14px] text-[#4f4f4f] font-[IinterRegular] whitespace-pre-wrap mt-[-1px] leading-4">
                            {msg.text}
                          </pre>
                        </div>
                        {/* <p key={index}>
                    <strong>{msg.name}:</strong> {msg.text}
                  </p> */}
                      </div>
                    ))}
                  </div>
                  <div
                    className="w-full h-[55px]  border-t-[1.5px] border-[#ecf0f5] flex justify-center
             items-center"
                  >
                    <textarea
                      className="outline-none resize-none pt-[15px] w-[calc(100%-50px)] h-full text-[black] pl-[15px]"
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <button
                      className="w-[50px] h-full flex justify-center items-center"
                      onClick={sendMessage}
                    >
                      <div className="min-w-[30px] min-h-[30px] flex justify-center items-center hover:bg-[#0F172A] hover:text-white text-black bg-white rounded-full">
                        <Forward
                          width={18}
                          height={18}
                          strokeWidth={2.2}
                          className="mr-[0px]"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sudoku Board */}
            {/* <div className="sudoku-board">
        {currBoard.split(",").map((cell, index) => {
          const isBaseCell = board[index] !== "0";
          const isCorrect = currBoard[index] === solvedBoard[index];
          let cellColor = "white";

          if (!isBaseCell) {
            cellColor = isCorrect
              ? "green"
              : currBoard[index] !== "0"
              ? "red"
              : "white";
          }

          return (
            <input
              key={index}
              type="number"
              min="1"
              max="9"
              value={cell === "0" ? "" : cell}
              disabled={isBaseCell} // Disable input for base numbers
              style={{ backgroundColor: cellColor }}
              onChange={(e) => updateCell(index, e.target.value)}
            />
          );
        })}
      </div> */}
            {/* <div className="w-full bg-slate-100  h-[600px]">
        <div className="w-full h-full bg-slate-300"></div>
      </div> */}

            {/* Chat Section */}
            {/* <div className="chat-section">
        <div className="chat-box">
          {chat.map((msg, index) => (
            <p key={index}>
              <strong>{msg.name}:</strong> {msg.text}
            </p>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div> */}
          </div>
        </>
      )}
    </>
  );
};

export default GamePage;
