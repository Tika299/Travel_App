import React from "react";

const Taskbar = () => {
    return (
        <div className="bg-gray-800 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Travel App</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="/" className="hover:text-red-400">Home</a></li>
                        <li><a href="/favourites" className="hover:text-red-400">Favourites</a></li>
                        <li><a href="/about" className="hover:text-red-400">About</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Taskbar;