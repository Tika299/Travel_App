import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import { favouriteService } from "../../../services/ui/favouriteService";

const HotelCard = memo(({ hotel, favourites, toggleFavourite }) => {
    const roomImage =
        hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images
            ? JSON.parse(hotel.rooms[0].images)[0]
            : hotel.image || "/public/img/default-hotel.jpg";
    const price = Number(hotel.rooms[0].price_per_night)
        .toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ";
    const isFavourited = favourites.some(
        (fav) =>
            fav.favouritable_id === hotel.id && fav.favouritable_type === "App\\Models\\Hotel"
    );

    return (
        <div className="relative">
            <Link to={`/hotels/${hotel.id}`} className="bg-white shadow-lg rounded mb-4">
                <div className="flex p-3 rounded-lg shadow-xl">
                    <div
                        className="bg-cover bg-center w-48 h-64 rounded-xl"
                        style={{ backgroundImage: `url(${roomImage})` }}
                    />
                    <div className="px-4 w-full">
                        <div className="bg-blue-400 text-white px-4 rounded text-lg w-fit my-2">
                            {hotel.type}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                        <div className="flex items-center space-x-2 my-4">
                            <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                            <span className="text-gray-600">{hotel.address}</span>
                        </div>
                        <p className="text-black-600 text-sm h-12 overflow-hidden">
                            {hotel.description}
                        </p>
                        <div className="flex items-center space-x-2 mb-3">
                            <p className="text-blue-500 font-bold text-sm">{price}</p>
                            <p className="text-gray-400 italic text-sm">/đêm</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-sm italic">
                                Đã bao gồm thuế và phí
                            </p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-xl">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
            <div
                onClick={async (e) => {
                    e.stopPropagation();
                    await toggleFavourite(hotel, "App\\Models\\Hotel");
                }}
                className="absolute top-4 right-4 bg-white p-3 rounded-full cursor-pointer"
            >
                {isFavourited ? (
                    <FaHeart className="h-6 w-6 text-red-600" />
                ) : (
                    <IoMdHeartEmpty className="h-6 w-6" />
                )}
            </div>
        </div>
    );
});

function HotelPage() {
    const [favourites, setFavourites] = useState([]);
    const [favouritesLoaded, setFavouritesLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy danh sách hotel từ API
                const res = await fetch("http://localhost:8000/api/hotels");
                const data = await res.json();
                setHotels(data.data || data); // Điều chỉnh dựa trên cấu trúc API trả về

                // Lấy danh sách yêu thích từ API
                if (localStorage.getItem("token")) {
                    const favResponse = await favouriteService.getFavourites();
                    setFavourites(favResponse.data || favResponse);
                }
                setFavouritesLoaded(true);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleFavourite = async (hotel, type) => {
        try {
            const isCurrentlyFavourited = favourites.some(
                (fav) =>
                    fav.favouritable_id === hotel.id && fav.favouritable_type === type
            );

            if (isCurrentlyFavourited) {
                await favouriteService.removeFavourite(hotel.id, type); // Giả định API có phương thức remove
                setFavourites(
                    favourites.filter(
                        (fav) => fav.favouritable_id !== hotel.id || fav.favouritable_type !== type
                    )
                );
            } else {
                const newFavourite = await favouriteService.addFavourite(hotel.id, type); // Giả định API có phương thức add
                setFavourites([...favourites, newFavourite]);
            }
        } catch (error) {
            console.error("Lỗi khi toggle favourite", error);
        }
    };

    const isFavourited = (hotel) =>
        favourites.some(
            (fav) =>
                fav.favouritable_id === hotel.id && fav.favouritable_type === "App\\Models\\Hotel"
        );

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Tất cả khách sạn</h1>
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {hotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                hotel={hotel}
                                favourites={favourites}
                                toggleFavourite={toggleFavourite}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default HotelPage;