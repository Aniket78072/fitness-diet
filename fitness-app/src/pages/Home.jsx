import React from "react";
import bgImage from "../assets/bg.jpg";

export default function Home() {
  return (
    <>
      <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-start p-10">
          <p className="text-white uppercase tracking-widest mb-2">Shape Your Body</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-orange-500 mb-4">
            Be <span className="border-white ">Strong</span><br />
            Training Hard
          </h1>
          <button className="">
            <a href="/dashboard" className="bg-white text-black px-6 py-3 rounded  transition"> Get start</a>
          </button>
        </div>
      </div>
    
    </>
  );
}
