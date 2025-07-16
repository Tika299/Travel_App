import banerImage from "../../assets/images/banner_reviewpage.jpg";
const ReviewPage = () => {
  return (
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

      {/* User Create Review */}
      <div className="mt-5 w-full shadow-lg border rounded-md"></div>
    </div>
  );
};

export default ReviewPage;
