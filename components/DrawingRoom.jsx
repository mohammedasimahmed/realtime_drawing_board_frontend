"use client";
import DrawingBoard from "./DrawingBoard";
import socketInitialize from "@/utils/socketInitialize";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const DrawingRoom = ({ roomid }) => {
  const [socket, setSocket] = useState(socketInitialize());
  const [chat, setChat] = useState([]);
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleChats = (e) => {
    e.preventDefault();
    setChat((prevChats) => [...prevChats, value]);
    socket.emit("send_text", value);
    setValue("");
  };
  useEffect(() => {
    socket.emit("join_room", roomid);
    socket.on("receive_text", (txt) => {
      setChat((prevChats) => [...prevChats, txt]);
    });
  }, []);
  return (
    <>
      <div className="text-white w-screen h-screen flex flex-col justify-center p-3">
        <div className="h-full md:h-4/5 w-fit md:w-screen flex flex-col md:flex-row  justify-around items-center ">
          <div className="h-2/3 w-full md:h-full xl:w-[800px] lg:w-[700px] md:w-[520px]">
            <DrawingBoard socket={socket} />
          </div>
          <div className="h-1/3 md:h-full flex flex-col w-full mt-2 md:mt-0 md:p-0 xl:w-[400px] lg:w-[320px] md:w-[250px]">
            <div className="w-full p-1 bg-green-900 text-white text-center text-xl font-semibold">
              Live Chat
            </div>
            <div className="flex-1 w-full bg-white rounded overflow-scroll">
              {chat.map((item, idx) => {
                return (
                  <div
                    className="text-black p-2 pb-1 hover:bg-slate-300"
                    key={idx}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
            <form action="" onSubmit={(e) => handleChats(e)} className="w-full">
              <input
                type="text"
                className="mt-1 rounded p-1 px-2 text-black w-full outline-none"
                placeholder="Enter Message"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
      <div className="w-screen bg-cyan-950 flex justify-center md:fixed md:bottom-0">
        <button
          className="text-white bg-red-700 text-xl p-2 rounded"
          onClick={() => router.push("/")}
        >
          Leave Room
        </button>
      </div>
    </>
  );
};

export default DrawingRoom;
