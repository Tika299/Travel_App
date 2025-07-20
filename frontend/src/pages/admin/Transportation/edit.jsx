import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTransportationById,
  updateTransportation,
} from "../../../services/ui/Transportation/transportationService.js"; // Đã điều chỉnh đường dẫn

const tags = ["uy_tin", "pho_bien", "cong_nghe"];
const features = ["has_app", "card_payment", "insurance"];

const EditTransportation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState({ icon: null, banner: null });
  const [initialFormState, setInitialFormState] = useState(null); // Để lưu trạng thái ban đầu
  const [submitting, setSubmitting] = useState(false);

  /* Load data */
  useEffect(() => {
    const fetchTransportationData = async () => {
      try {
        const res = await getTransportationById(id);
        const t = res.data.data;
        const parsedTags = Array.isArray(t.tags)
          ? t.tags
          : JSON.parse(t.tags || "[]");
        const parsedFeatures = Array.isArray(t.features)
          ? t.features
          : JSON.parse(t.features || "[]");

        const currentForm = {
          ...t,
          tags: parsedTags,
          features: parsedFeatures,
          icon: null, // Sẽ được cập nhật nếu có file mới
          banner: null, // Sẽ được cập nhật nếu có file mới
          // Đảm bảo các trường này có giá trị mặc định để tránh undefined
          average_price: t.average_price ?? "",
          rating: t.rating ?? "",
          description: t.description ?? "",
          address: t.address ?? "", // Thêm trường địa chỉ
          is_visible: t.is_visible ?? false,
        };

        setForm(currentForm);
        setInitialFormState(currentForm); // Lưu trạng thái ban đầu
        setPreview({ icon: t.icon_url, banner: t.banner_url }); // Hiển thị ảnh hiện có
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu phương tiện:", err);
        alert(
          "Không tìm thấy loại phương tiện này hoặc có lỗi khi tải dữ liệu!"
        );
        navigate("/admin/transportations");
      }
    };
    fetchTransportationData();
  }, [id, navigate]);

  // Hàm xử lý đầu vào cho các trường text/number
  const handleInput = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Hàm xử lý checkbox cho tags và features
  const handleCheckbox = useCallback((key, value) => {
    setForm((prev) => {
      const list = prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value];
      return { ...prev, [key]: list };
    });
  }, []);

  // Hàm xử lý file input
  const handleFile = useCallback((field, file) => {
    setForm((prev) => ({ ...prev, [field]: file }));
    setPreview((prev) => ({
      ...prev,
      [field]: file ? URL.createObjectURL(file) : null,
    }));
  }, []);

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        // Xử lý các trường đặc biệt
        if (["tags", "features"].includes(k)) {
          fd.append(k, JSON.stringify(v));
        } else if (k === "icon" && v instanceof File) {
          fd.append("icon_file", v); // Đổi tên để khớp với backend nếu cần
        } else if (k === "banner" && v instanceof File) {
          fd.append("banner_file", v); // Đổi tên để khớp với backend nếu cần
        } else if (v !== null) {
          // Bỏ qua icon và banner nếu không có file mới
          fd.append(k, v);
        }
      });

      // Nếu không có file icon/banner mới được chọn, giữ lại url cũ
      if (!form.icon && preview.icon && typeof preview.icon === "string") {
        // Không thêm gì vào FormData nếu không có file mới và url cũ tồn tại
        // Tuy nhiên, nếu bạn muốn gửi lại URL cũ để backend biết không có thay đổi file, bạn cần thêm nó vào đây
        // Ví dụ: fd.append('icon_url', preview.icon);
      }
      if (
        !form.banner &&
        preview.banner &&
        typeof preview.banner === "string"
      ) {
        // Tương tự cho banner
        // Ví dụ: fd.append('banner_url', preview.banner);
      }

      // Xử lý phương thức PUT cho Laravel (nếu backend yêu cầu _method)
      fd.append("_method", "PUT");

      await updateTransportation(id, fd);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/transportations");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("❌ Cập nhật thất bại! Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm reset form về trạng thái ban đầu
  const handleReset = () => {
    if (initialFormState) {
      setForm(initialFormState);
      setPreview({
        icon: initialFormState.icon_url,
        banner: initialFormState.banner_url,
      });
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-gray-700 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Chỉnh sửa phương tiện
          </h1>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-gray-600 text-lg"></i>
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 font-medium">Admin</span>
          </div>
        </header>

        {/* Step Indicator */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center text-blue-600 font-semibold">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
              1
            </div>
            Bắt đầu điền thông tin Phương tiện
          </div>
          <p className="text-sm text-gray-500 ml-10">
            Điền các thông tin cần thiết về danh sách phương tiện
          </p>
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              <i className="fas fa-info-circle mr-2 text-blue-500"></i> Thông
              tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên Phương tiện */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên phương tiện *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Icon Phương tiện */}
              <div>
                <label
                  htmlFor="icon"
                  className="block text-sm font-medium text-gray-700"
                >
                  Icon phương tiện (tuỳ chọn)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    {preview.icon || form.icon_url ? (
                      <img
                        src={preview.icon || form.icon_url}
                        alt="icon-preview"
                        className="mx-auto h-16 w-16 object-contain"
                      />
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H10c-1.1 0-2 .9-2 2v28c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V20M28 8V2h8L28 8zm0 0h8v6l-8-6zm-4 4h4v4h-4zM24 16h-4v-4h4zM16 16h-4v-4h4zM24 24h-4v-4h4zM16 24h-4v-4h4zM24 32h-4v-4h4zM16 32h-4v-4h4zM24 40h-4v-4h4zM16 40h-4v-4h4z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="icon_file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Kéo thả icon phương tiện</span>
                        <input
                          id="icon_file"
                          name="icon_file"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) =>
                            handleFile("icon", e.target.files[0])
                          }
                        />
                      </label>
                      <p className="pl-1">hoặc chọn file</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF dưới 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Mô tả chi tiết
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInput}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            {/* Địa chỉ */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleInput}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Giá trung bình */}
              <div>
                <label
                  htmlFor="average_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Giá trung bình (VND)
                </label>
                <input
                  type="number"
                  id="average_price"
                  name="average_price"
                  value={form.average_price}
                  onChange={handleInput}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Hạng đánh giá */}
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hạng đánh giá
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={handleInput}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              <i className="fas fa-image mr-2 text-blue-500"></i> Hình ảnh
            </h2>
            <div>
              <label
                htmlFor="banner"
                className="block text-sm font-medium text-gray-700"
              >
                Ảnh chính (Banner) (tuỳ chọn)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {preview.banner || form.banner_url ? (
                    <img
                      src={preview.banner || form.banner_url}
                      alt="banner-preview"
                      className="mx-auto h-32 w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H10c-1.1 0-2 .9-2 2v28c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V20M28 8V2h8L28 8zm0 0h8v6l-8-6zm-4 4h4v4h-4zM24 16h-4v-4h4zM16 16h-4v-4h4zM24 24h-4v-4h4zM16 24h-4v-4h4zM24 32h-4v-4h4zM16 32h-4v-4h4zM24 40h-4v-4h4zM16 40h-4v-4h4z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="banner_file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Kéo thả hình ảnh vào đây</span>
                      <input
                        id="banner_file"
                        name="banner_file"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) =>
                          handleFile("banner", e.target.files[0])
                        }
                      />
                    </label>
                    <p className="pl-1">hoặc chọn file</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF dưới 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags và Tính năng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <fieldset className="p-4 border border-gray-200 rounded-md shadow-sm">
              <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2 -mt-4 bg-white">
                <i className="fas fa-tags mr-2 text-blue-500"></i> Tags
              </legend>
              <div className="space-y-2">
                {tags.map((t) => (
                  <label
                    key={t}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.tags.includes(t)}
                      onChange={() => handleCheckbox("tags", t)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="p-4 border border-gray-200 rounded-md shadow-sm">
              <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2 -mt-4 bg-white">
                <i className="fas fa-cogs mr-2 text-blue-500"></i> Tính năng
              </legend>
              <div className="space-y-2">
                {features.map((f) => (
                  <label
                    key={f}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.features.includes(f)}
                      onChange={() => handleCheckbox("features", f)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span>{f.replace(/_/g, " ")}</span>{" "}
                    {/* Hiển thị tên tính năng dễ đọc hơn */}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* is_visible */}
          <div className="pt-4">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={handleInput}
                name="is_visible" // Đặt tên để handleInput có thể xử lý
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
              />
              <span className="text-base font-medium">
                Hiển thị trên trang người dùng
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/transportations")}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md shadow-md hover:bg-gray-600 transition-colors duration-200"
            >
              <i className="fas fa-arrow-left mr-2"></i> Quay lại
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 transition-colors duration-200"
              disabled={submitting}
            >
              <i className="fas fa-sync-alt mr-2"></i> Đặt lại
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              {submitting ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Đang lưu...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="fas fa-save mr-2"></i> Lưu chỉnh sửa
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransportation;
