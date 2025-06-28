import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

const HomePage = () => {
  return (
    <div>
        <Header />
        <main className="mx-auto">
            <div className="slider bg-[url('/public/img/SliderHomePage.jpg')] bg-cover h-[500px] shadow-lg">
                <div className="container mx-auto flex flex-col justify-center h-full">
                    <h1 className="text-6xl font-bold text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}>Khám phá Việt Nam tuyệt vời</h1>
                    <p className="text-lg text-white mt-4 font-bold" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}>Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc đáo</p>
                    <div className="w-fit bg-gray-400 bg-opacity-20 mt-6 p-8">
                        <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-3 flex flex-col">
                                <span className="font-bold">Điểm đến</span>
                                <select name="destination" id="destination" className="w-full p-2 pb-3 border border-gray-300 rounded">
                                    <option value="default">Chọn điểm đến</option>
                                    <option value="1">Đà Nẵng</option>
                                    <option value="2">Hồ Chí Minh</option>
                                </select>
                            </div>
                            <div className="space-y-3 flex flex-col">
                                <span className="font-bold">Ngày khởi hành</span>
                                <input type="date" name="startDate" id="startDate" className="w-full p-2 border border-gray-300 rounded" />
                            </div>
                            <div className="space-y-3 flex flex-col">
                                <span className="font-bold">Số ngày</span>
                                <input type="number" name="numDays" id="numDays" className="w-full p-2 border border-gray-300 rounded" placeholder="Nhập số ngày"/>
                            </div>
                        </div>
                        <button className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300">
                            Bắt đầu khám phá
                        </button>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default HomePage;