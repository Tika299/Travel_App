import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
// Đảm bảo đường dẫn này đúng:
// Thay vì createTransportation, chúng ta cần updateTransportation và getTransportationById
import { getTransportationById, updateTransportation } from "../../../services/ui/Transportation/transportationService";

// Định nghĩa tags và features (Không thay đổi, lấy từ CreateTransportation)
const tags = [
  { value: "uy_tin", label: "Uy tín" },
  { value: "pho_bien", label: "Phổ biến" },
  { value: "cong_nghe", label: "Công nghệ" },
  // Thêm các tags khác nếu có
];

const features = [
  { value: "has_app", label: "Có ứng dụng đặt xe" },
  { value: "card_payment", label: "Hỗ trợ thanh toán app/ngân hàng" },
  { value: "insurance", label: "Có bảo hiểm chuyến đi" },
  { value: "gps_tracking", label: "Theo dõi GPS" },
];

// Định nghĩa component Label (Không thay đổi, lấy từ CreateTransportation)
const Label = ({ text, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {text}
  </label>
);

// Định nghĩa component InputField (Không thay đổi, lấy từ CreateTransportation)
const InputField = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  errors,
  min,
  max,
  step,
  checked,
}) => {
  const isTextArea = type === "textarea";
  const isCheckbox = type === "checkbox";

  const inputElement = isTextArea ? (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        errors ? "border-red-500" : "border-gray-300"
      }`}
    />
  ) : isCheckbox ? (
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
        errors ? "border-red-500" : ""
      }`}
    />
  ) : (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        errors ? "border-red-500" : "border-gray-300"
      }`}
    />
  );

  return (
    <div className="mb-4">
      {isCheckbox ? (
        <div className="flex items-center">
          {inputElement}
          <Label htmlFor={id} text={label} className="ml-2" />
        </div>
      ) : (
        <>
          <Label htmlFor={id} text={label} />
          {inputElement}
        </>
      )}
      {errors &&
        errors.map((error, index) => (
          <p key={index} className="text-red-500 text-xs mt-1">
            {error}
          </p>
        ))}
    </div>
  );
  };

// Định nghĩa component ImageUpload (Đã sửa để hiển thị ảnh cũ nếu không có ảnh mới)
const ImageUpload = ({ label, currentFile, currentImageUrl, onFileChange, onFileRemove, errors }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Nếu có file mới được chọn, ưu tiên hiển thị file đó
    if (currentFile instanceof File) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    // Nếu không có file mới, nhưng có URL ảnh cũ, hiển thị ảnh cũ
    else if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
    // Nếu không có cả hai, không hiển thị gì
    else {
      setPreviewUrl(null);
    }
  }, [currentFile, currentImageUrl]);

  return (
    <div className="mb-4">
      <Label text={label} />
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group">
        <input
          id={`file-upload-${label.replace(/\s+/g, "-")}`}
          name="image"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-1 text-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-contain rounded-md" />
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Kéo thả hình ảnh vào đây</span>
              <span className="sr-only">Choose file</span>
            </label>
            <p className="pl-1">hoặc</p>
            <label
              htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span className="ml-1">Chọn file</span>
              <span className="sr-only">Upload file</span>
            </label>
          </div>
          {(currentFile || currentImageUrl) && ( // Chỉ hiển thị nút xóa nếu có ảnh để xem trước
            <button
              type="button"
              onClick={onFileRemove}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Xóa ảnh
            </button>
          )}
        </div>
        {errors &&
          errors.map((error, index) => (
            <p key={index} className="text-red-500 text-xs mt-1">
              {error}
            </p>
          ))}
      </div>
    </div>
  );
};


const EditTransportation = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // Bắt đầu với null để hiển thị trạng thái tải
  const [initialFormState, setInitialFormState] = useState(null); // Lưu trữ trạng thái ban đầu để reset
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect để tải dữ liệu khi component mount hoặc ID thay đổi
  useEffect(() => {
    const fetchTransportation = async () => {
      try {
        const res = await getTransportationById(id);
        const t = res.data.data;

        // Xử lý tags và features (backend có thể trả về string JSON hoặc array)
        const parsedTags = Array.isArray(t.tags) ? t.tags : JSON.parse(t.tags || "[]");
        const parsedFeatures = Array.isArray(t.features) ? t.features : JSON.parse(t.features || "[]");

        const initialData = {
          name: t.name ?? "",
          average_price: t.average_price ?? "",
          description: t.description ?? "",
          rating: t.rating ?? "",
          tags: parsedTags,
          features: parsedFeatures,
          icon: null, // File mới sẽ được đặt ở đây
          banner: null, // File mới sẽ được đặt ở đây
          icon_url: t.icon_url, // URL ảnh hiện tại
          banner_url: t.banner_url, // URL banner hiện tại
          is_visible: t.is_visible === 1, // Chuyển đổi từ số nguyên sang boolean
        };
        setForm(initialData);
        setInitialFormState(initialData); // Lưu trạng thái ban đầu
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu phương tiện:", err);
        setGeneralError("Không thể tải dữ liệu phương tiện. Vui lòng thử lại.");
        // Điều hướng trở lại trang danh sách nếu không tìm thấy
        setTimeout(() => navigate("/admin/transportations"), 3000);
      }
    };

    fetchTransportation();
  }, [id, navigate]); // Dependencies: ID và navigate

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    setGeneralError(null);
  }, []);

  const handleMultiSelectChange = useCallback((e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setForm((prevForm) => ({
      ...prevForm,
      [name]: selectedValues,
    }));
    setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    setGeneralError(null);
  }, []);

  // Xử lý upload ICON
  const handleIconChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prevForm) => ({ ...prevForm, icon: file, icon_url: null })); // Xóa URL cũ nếu có file mới
    }
    setFieldErrors((prevErrors) => ({ ...prevErrors, icon: undefined }));
    setGeneralError(null);
  }, []);

  const handleIconRemove = useCallback(() => {
    setForm((prevForm) => ({ ...prevForm, icon: null, icon_url: null })); // Xóa cả file và URL
    setFieldErrors((prevErrors) => ({ ...prevErrors, icon: undefined }));
    setGeneralError(null);
  }, []);

  // Xử lý upload BANNER
  const handleBannerChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prevForm) => ({ ...prevForm, banner: file, banner_url: null })); // Xóa URL cũ nếu có file mới
    }
    setFieldErrors((prevErrors) => ({ ...prevErrors, banner: undefined }));
    setGeneralError(null);
  }, []);

  const handleBannerRemove = useCallback(() => {
    setForm((prevForm) => ({ ...prevForm, banner: null, banner_url: null })); // Xóa cả file và URL
    setFieldErrors((prevErrors) => ({ ...prevErrors, banner: undefined }));
    setGeneralError(null);
  }, []);

  const handleReset = useCallback(() => {
    // Đặt lại form về trạng thái ban đầu đã tải
    if (initialFormState) {
      setForm(initialFormState);
      setFieldErrors({});
      setGeneralError(null);
      setSuccessMessage(null);
    }
  }, [initialFormState]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setGeneralError(null);
      setFieldErrors({});

      const formData = new FormData();

      // Thêm các trường dữ liệu vào FormData
      for (const key in form) {
        if (form[key] !== null && form[key] !== undefined) {
          if (key === "tags" || key === "features") {
            // Đối với mảng tags/features, append từng phần tử
            form[key].forEach((item) => {
              formData.append(`${key}[]`, item);
            });
          } else if (key === "icon" && form[key] instanceof File) {
            formData.append("icon", form[key]); // Chỉ gửi file nếu có file mới
          } else if (key === "banner" && form[key] instanceof File) {
            formData.append("banner", form[key]); // Chỉ gửi file nếu có file mới
          } else if (key === "is_visible") {
            formData.append(key, form[key] ? '1' : '0'); // Laravel có thể yêu cầu 1/0
          } else if (key !== "icon_url" && key !== "banner_url") { // Không gửi lại các URL cũ dưới dạng dữ liệu form thông thường
            formData.append(key, form[key]);
          }
        }
      }

      // Thêm _method PUT cho Laravel API
      formData.append("_method", "PUT");

      try {
        const response = await updateTransportation(id, formData); // Gọi hàm updateTransportation
        if (response.data.success) {
          setSuccessMessage(response.data.message || "Phương tiện đã được cập nhật thành công!");
          // Có thể tải lại dữ liệu sau khi cập nhật thành công để hiển thị ảnh mới
          // hoặc chỉ cần điều hướng
          setTimeout(() => navigate("/admin/transportations"), 2000);
        } else {
          setGeneralError(response.data.message || "Có lỗi xảy ra khi cập nhật phương tiện.");
          if (response.data.errors) {
            setFieldErrors(response.data.errors);
          }
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật phương tiện:", err);
        if (err.response && err.response.data && err.response.data.errors) {
          setFieldErrors(err.response.data.errors);
          setGeneralError(
            err.response.data.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
          );
        } else {
          setGeneralError(err.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [id, form, navigate] // Dependencies cho useCallback
  );

  // Hiển thị trạng thái tải khi form chưa có dữ liệu
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-gray-700 text-lg">Đang tải dữ liệu phương tiện...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <main className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Chỉnh Sửa Phương Tiện</h1>

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {generalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái */}
            <div>
              <InputField
                label="Tên phương tiện"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên phương tiện"
                required
                errors={fieldErrors.name}
              />
              <InputField
                label="Giá trung bình"
                id="average_price"
                name="average_price"
                type="number"
                value={form.average_price}
                onChange={handleChange}
                placeholder="Ví dụ: 50000"
                errors={fieldErrors.average_price}
              />
              <InputField
                label="Đánh giá (0-5)"
                id="rating"
                name="rating"
                type="number"
                value={form.rating}
                onChange={handleChange}
                placeholder="Ví dụ: 4.5"
                min="0"
                max="5"
                step="0.1"
                errors={fieldErrors.rating}
              />
            </div>

            {/* Cột phải */}
            <div>
              <ImageUpload
                label="Icon (Biểu tượng - Ảnh)"
                currentFile={form.icon}
                currentImageUrl={form.icon_url} // Truyền URL ảnh cũ
                onFileChange={handleIconChange}
                onFileRemove={handleIconRemove}
                errors={fieldErrors.icon}
              />
              <ImageUpload
                label="Banner (Ảnh lớn)"
                currentFile={form.banner}
                currentImageUrl={form.banner_url} // Truyền URL banner cũ
                onFileChange={handleBannerChange}
                onFileRemove={handleBannerRemove}
                errors={fieldErrors.banner}
              />

              <InputField
                label="Mô tả"
                id="description"
                name="description"
                type="textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả về phương tiện..."
                errors={fieldErrors.description}
              />

              <div className="mb-4">
                <Label text="Tags" htmlFor="tags" />
                <select
                  id="tags"
                  name="tags"
                  multiple
                  value={form.tags}
                  onChange={handleMultiSelectChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 h-32 ${
                    fieldErrors.tags ? "border-red-500" : ""
                  }`}
                >
                  {tags.map((tag) => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Giữ Ctrl/Cmd để chọn nhiều.</p>
                {fieldErrors.tags &&
                  fieldErrors.tags.map((error, index) => (
                    <p key={index} className="text-red-500 text-xs mt-1">
                      {error}
                    </p>
                  ))}
              </div>

              <div className="mb-4">
                <Label text="Features" htmlFor="features" />
                <select
                  id="features"
                  name="features"
                  multiple
                  value={form.features}
                  onChange={handleMultiSelectChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 h-32 ${
                    fieldErrors.features ? "border-red-500" : ""
                  }`}
                >
                  {features.map((feature) => (
                    <option key={feature.value} value={feature.value}>
                      {feature.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Giữ Ctrl/Cmd để chọn nhiều.</p>
                {fieldErrors.features &&
                  fieldErrors.features.map((error, index) => (
                    <p key={index} className="text-red-500 text-xs mt-1">
                      {error}
                    </p>
                  ))}
              </div>

              {/* Thêm trường is_visible */}
              <InputField
                label="Hiển thị trên ứng dụng/website"
                id="is_visible"
                name="is_visible"
                type="checkbox"
                checked={form.is_visible}
                onChange={handleChange}
                errors={fieldErrors.is_visible}
              />
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/transportations")} // Quay lại trang danh sách
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
              disabled={submitting}
            >
              Đặt lại
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-md font-medium text-white transition-colors ${
                submitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Đang lưu..." : "Lưu chỉnh sửa"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditTransportation;