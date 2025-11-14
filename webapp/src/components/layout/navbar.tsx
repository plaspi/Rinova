import React from "react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center bg-white shadow px-6 py-4 fixed w-full top-0 z-10">
      <h1 className="text-xl font-bold text-green-600">Rinova</h1>
      <div className="flex space-x-4">
        <a href="/home" className="text-gray-700 hover:text-green-600">Home</a>
        <a href="/login" className="text-gray-700 hover:text-green-600">Login</a>
        <a href="/register" className="text-gray-700 hover:text-green-600">Registrati</a>
      </div>
    </nav>
  );
}
