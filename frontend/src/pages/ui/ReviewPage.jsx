import { FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import banerImage from "../../assets/images/banner_reviewpage.jpg";
import Header from "../../components/Header";
import CardReview from "../../components/review/CardReview";
import Footer from "../../components/Footer";
const ReviewPage = () => {
  return (
    <>
      <Header />

      {/* Banner */}
      <div className="p-2">
        <div
          className="w-full h-[150px] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${banerImage})`,
          }}
        >
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
            <h1 className="text-4xl font-bold text-white">Review Du Lịch</h1>
            <p className="mt-2 text-sm italic">
              Chia sẻ những trải nghiệm của bạn tại các địa điểm đã ghé thăm
            </p>
          </div>
        </div>
      </div>

      {/* User Post Review */}
      <div className="mt-5 max-w-7xl shadow-lg border rounded-md p-4 mx-auto">
        <form action="" className="flex items-start space-x-4">
          {/* Avatar User*/}
          <img
            src={banerImage}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Bạn đang ở đâu, hãy chia sẻ những trải nghiệm của mình..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none text-sm"
            />
            <div className="flex justify-between items-center mt-3 px-2">
              <div className="flex space-x-4 text-gray-500 text-sm">
                <button
                  type="button"
                  className="flex items-center space-x-1 hover:text-blue-500"
                >
                  <FaCamera />
                  <span>Chụp ảnh</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-1 hover:text-blue-500"
                >
                  <FaMapMarkerAlt />
                  <span>Thêm vị trí</span>
                </button>
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 text-sm"
              >
                Đăng
              </button>
            </div>
          </div>
        </form>
      </div>
      <CardReview />
      <Footer />
    </>
  );
};

export default ReviewPage;
