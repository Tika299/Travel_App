import { FaLocationDot, FaRegStar, FaStar, FaTrashCan } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BiComment, BiDotsHorizontalRounded } from "react-icons/bi";
import { ThumbsUp, MessageSquare } from "lucide-react";
import ReviewImages from "./ReviewImages";
import { FaStarHalfAlt } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { TbStatusChange } from "react-icons/tb";
import ExpandableText from "./ExpandableText";
import {
  toggleLike,
  getLikeStatus,
} from "../../services/ui/Review/reviewService";

const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
};

const PostTime = ({ createdAt }) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
  return timeAgo;
};

export default function CardReview({ review, user, onEdit, onDelete }) {
  const isOwner = user?.id === review.user.id;
  const [openMenu, setOpenMenu] = useState(false);
  const toggleMenu = () => setOpenMenu((prev) => !prev);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    const fetchLike = async () => {
      try {
        const res = await getLikeStatus(review.id);
        setLikeCount(res.like_count);
        setLiked(res.liked_by_user);
      } catch (err) {
        console.error("Lỗi lấy trạng thái like:", err);
      }
    };
    if (user) fetchLike();
  }, [review.id, user]);

  const handleLike = async () => {
    try {
      const res = await toggleLike(review.id);
      setLiked(res.liked);
      setLikeCount((prev) => (res.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Lỗi toggle like:", err);
    }
  };

  return (
    <div className="mt-5 max-w-7xl xl:mx-auto lg:mx-10 md:mx-10 sm:mx-5">
      <div key={review.id} className="my-10 shadow-lg border p-4 rounded-xl">
        {/* Thông tin user post bài review */}
        <div className="flex items-start ">
          <img
            src={review.user.avatar}
            alt="Avatar"
            className="w-14 h-14 object-cover rounded-full"
          />

          <div className="w-full ml-5">
            <h2 className="text-xl font-bold">{review.user.name}</h2>
            <span className="flex items-center text-center mt-1 text-sm font-sans italic space-x-2">
              <StarRating rating={review.rating} />
              <FaLocationDot className="text-red-600 mr-1" />
              {review.reviewable_id || "Location"} •{" "}
              <PostTime createdAt={review.created_at} />
            </span>
          </div>

          {/* Update - Delete */}
          <div className="relative inline-block text-left">
            {/* Icon ba chấm */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <BiDotsHorizontalRounded className="text-xl" />
            </button>
          </div>
          {/* Menu mini */}
          {openMenu && (
            <div
              ref={menuRef}
              className="absolute right-20 mt-8 w-50 bg-white border shadow-lg rounded-lg z-20 text-sm"
            >
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      onEdit(review);
                    }}
                    className=" w-full text-left p-2 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <TbStatusChange /> Chỉnh sửa bài viết
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      onDelete(review.id);
                    }}
                    className=" w-full text-left p-2 text-red-600 hover:bg-red-50"
                  >
                    <span className="flex items-center gap-2">
                      <FaTrashCan /> Xoá
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Conter Post */}
        <div className="mt-2 flex items-start">
          <span className="text-1sm">
            <ExpandableText text={review.content} maxLength={90} />
          </span>
        </div>
        {/* Image Post */}
        {review.images?.length > 0 && <ReviewImages images={review.images} />}

        <div className="border-t-2 ">
          <div className="flex justify-between text-center mt-2">
            <button
              className={`flex px-20 py-1 hover:bg-gray-100 justify-center rounded-md transition-colors 
              duration-200 active:scale-95  ${
                liked ? "text-blue-600" : "text-neutral-700"
              }`}
              onClick={handleLike}
            >
              <span className="flex gap-2 font-medium items-center">
                <ThumbsUp size={22} />
                {likeCount} Like
              </span>
            </button>

            <button className="flex px-20 py-1 hover:bg-gray-100 justify-center rounded-md">
              <span className="flex gap-2 font-medium text-neutral-700">
                <MessageSquare size={22} /> Comment
              </span>
            </button>
          </div>

          {/* <div className="border-t w-full">
            <div className="flex mt-4 w-full items-center space-x-4">
              <img
                src={user?.avatar}
                alt="avatar_user"
                className="rounded-full w-12 h-12"
              />
              <div className="w-full flex space-x-2">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="w-full px-4 py-3 bg-white-100 rounded-full border text-sm"
                />
                <button className="">
                  <IoMdSend />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
