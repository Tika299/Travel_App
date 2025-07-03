import React from 'react';

const Header = () => (
  <div className="relative h-64 w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1500&q=80')` }}>
    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    <div className="relative z-10 text-center text-white">
      <h1 className="text-4xl md:text-5xl font-bold italic mb-2">TẠO LỊCH TRÌNH CHO BẠN</h1>
      <p className="text-lg md:text-xl">Lên kế hoạch chi tiết cho chuyến du lịch hoàn hảo</p>
    </div>
  </div>
);

export default Header; 