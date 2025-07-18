import avatar_user from "../../assets/images/avatar_user_review.jpg";
import post_user from "../../assets/images/post_user_review.jpg";
import avatar_user_2 from "../../assets/images/avatar_user_review_2.png";
import post_user_2 from "../../assets/images/post_user_review_2.jpg";
import avatar_post_user_comment from "../../assets/images/avatar_user_comment.png";
import { FaDiagramNext, FaLocationDot } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BiComment,
  BiDotsHorizontalRounded,
  BiHeart,
  BiShare,
} from "react-icons/bi";
import { IoMdSend } from "react-icons/io";

const dataPost = [
  {
    postId: "p001",
    user: {
      userId: "u001",
      name: "Minh Hoàng",
      avatarUrl: avatar_user,
      location: "Hạ Long Bay",
    },
    createdAt: "2025-07-17T09:15:00+07:00",
    content:
      "Vịnh Hạ Long thực sự tuyệt vời! Cảnh đẹp như tranh vẽ, du thuyền sang trọng và dịch vụ tuyệt vời. Chắc chắn sẽ quay lại lần nữa! 🛳✨",
    imageUrl: post_user,
    stats: {
      likes: 245,
      comments: 32,
      shares: 12,
    },
  },
  {
    postId: "p002",
    user: {
      userId: "u002",
      name: "Ngọc Trâm",
      avatarUrl: avatar_user_2,
      location: "Hội An Ancient Town",
    },
    createdAt: "2025-07-18T07:00:00+07:00",
    content:
      "Phố cổ Hội An về đêm thật lung linh! Những chiếc đèn lồng rực rỡ tạo nên khung cảnh như trong cổ tích. Món ăn ở đây cũng ngon tuyệt! 🏮🥢",
    imageUrl: post_user_2,
    stats: {
      likes: 178,
      comments: 20,
      shares: 9,
    },
  },
  {
    postId: "p003",
    user: {
      userId: "u003",
      name: "Trần Duy",
      avatarUrl: avatar_user,
      location: "Hội An",
    },
    createdAt: "2025-07-17T21:45:00+07:00",
    content:
      "Đêm Hội An thật lung linh. Đèn lồng khắp nơi, phố cổ rực rỡ màu sắc ✨🏮",
    imageUrl: post_user,
    stats: {
      likes: 312,
      comments: 45,
      shares: 18,
    },
  },
];

const PostTime = ({ createdAt }) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
  return timeAgo;
};
export default function CardReview() {
  return (
    <div className="mt-7 max-w-7xl mx-auto">
      {dataPost.map((post) => (
        <div
          key={post.postId}
          className="my-10 shadow-lg border p-4 rounded-xl"
        >
          {/* Thông tin user post bài review */}
          <div className="flex items-start ">
            <img
              src={post.user.avatarUrl}
              alt="Avatar"
              className="w-14 h-14 object-cover rounded-full"
            />
            <div className="w-full ml-5">
              <h2 className="text-xl font-bold">{post.user.name}</h2>
              <span className="flex items-center text-center mt-1 text-sm font-sans italic">
                <FaLocationDot className="text-red-600 mr-1" />
                {post.user.location} • <PostTime createdAt={post.createdAt} />
              </span>
            </div>
            <div>
              <button>
                <BiDotsHorizontalRounded />
              </button>
            </div>
          </div>

          {/* Conter Post */}
          <div className="mt-2 flex items-start">
            <span className="text-1sm">{post.content}</span>
          </div>

          {/* Image Post */}
          <div className="mt-2 w-full h-[460px]">
            <img
              src={post.imageUrl}
              alt="image_user_post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats Post */}
          <div className="my-2 flex items-start ml-4">
            <button className="flex text-center items-center mr-5">
              <BiHeart className="w-6 h-6 mr-0.5" />{" "}
              <span className="font-medium text-neutral-700">
                {post.stats.likes}
              </span>
            </button>

            <button className="flex text-center items-center mr-5">
              <BiComment className="w-6 h-6 mr-0.5" />{" "}
              <span className="font-medium text-neutral-700">
                {post.stats.comments}
              </span>
            </button>

            <button className="flex text-center items-center mr-5">
              <BiShare className="w-6 h-6 mr-0.5" />{" "}
              <span className="font-medium text-neutral-700">
                {post.stats.shares}
              </span>
            </button>
          </div>

          {/* Comment user */}
          <div className="border-t w-full">
            <div className="flex mt-4 w-full items-center space-x-4">
              <img
                src={avatar_post_user_comment}
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
          </div>
        </div>
      ))}
    </div>
  );
}
