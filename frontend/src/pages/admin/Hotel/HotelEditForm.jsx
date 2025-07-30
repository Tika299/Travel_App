import React, { useState, useEffect, useCallback } from "react";
// Đảm bảo đường dẫn đúng
import { createHotel, updateHotel } from "../../../services/ui/Hotel/hotelService";
import LocationSelectorMap from "../../../common/LocationSelectorMap";

const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null, // Dành cho file ảnh mới
    old_image_path: null, // Dành cho đường dẫn ảnh cũ từ DB
    rating: "",
    review_count: 0,
    email: "",
    phone: "",
    wheelchair_access: false,
};

export default function HotelForm({ hotelData, onCancel, onSubmit }) {
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing] = useState(!!hotelData); // Xác định đang ở chế độ chỉnh sửa hay tạo mới

    // Khởi tạo form với dữ liệu khách sạn nếu là chế độ chỉnh sửa
    useEffect(() => {
        if (hotelData) {
            const getImageUrl = (path) => {
                if (!path) return null;
                if (path.startsWith("http://") || path.startsWith("https://")) {
                    return path;
                }
                // Giả định ảnh được lưu trong public/img/ hoặc public/storage/uploads/hotels/
                // Nếu ảnh được lưu trong public/img/, thì path sẽ là 'img/ten_file.jpg'
                // Nếu ảnh được lưu trong storage/app/public/uploads/hotels/ và được link qua storage:link,
                // thì path sẽ là 'uploads/hotels/ten_file.jpg' và cần đường dẫn đầy đủ như dưới
                return `http://localhost:8000/storage/${path}`; // Điều chỉnh URL nếu khác
            };

            setForm({
                ...initialForm,
                ...hotelData,
                latitude: hotelData.latitude ? String(hotelData.latitude) : "",
                longitude: hotelData.longitude ? String(hotelData.longitude) : "",
                // Lưu đường dẫn ảnh cũ để hiển thị và gửi lại cho backend
                old_image_path: hotelData.images ? getImageUrl(hotelData.images) : null,
                // Dữ liệu số đảm bảo là số
                review_count: typeof hotelData.review_count === 'number' ? hotelData.review_count : 0,
            });

            if (hotelData.latitude && hotelData.longitude) {
                setShowMap(true);
            }
        }
    }, [hotelData]);

    /* -------------------------- Các hàm xử lý thay đổi form --------------------------- */

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;

        if (type === "number") {
            finalValue = value === "" ? "" : parseFloat(value);
        } else if (type === "checkbox") {
            finalValue = checked;
        }

        setForm((prev) => ({ ...prev, [name]: finalValue }));
        setErrors((prev) => ({ ...prev, [name]: undefined })); // Xóa lỗi khi người dùng nhập liệu
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp ảnh hợp lệ.");
            setForm((p) => ({ ...p, image: null })); // Đặt lại file nếu không hợp lệ
            return;
        }
        setForm((p) => ({ ...p, image: file })); // Lưu file ảnh mới
        setErrors((p) => ({ ...p, images: undefined })); // Xóa lỗi ảnh
    }, []);

    // Xóa ảnh chính
    const removeImage = useCallback(() => {
        setForm((p) => ({ ...p, image: null, old_image_path: null }));
        setErrors((p) => ({ ...p, images: undefined }));
    }, []);


    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === "number" ? lat.toFixed(6) : "";
        const newLng = typeof lng === "number" ? lng.toFixed(6) : "";

        setForm((prev) => ({ ...prev, latitude: newLat, longitude: newLng }));
        setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
    }, []);

    /* --------------------------- Xác thực và Gửi Form --------------------------- */

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Tên khách sạn không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (form.latitude === "" || form.longitude === "" || isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
            newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
        }
        if (form.rating && (isNaN(parseFloat(form.rating)) || parseFloat(form.rating) < 0 || parseFloat(form.rating) > 5)) {
            newErrors.rating = "Hạng đánh giá phải là một số từ 0 đến 5.";
        }
        if (!form.phone.trim()) {
            newErrors.phone = "Số điện thoại không được để trống.";
        }

        // Khi tạo mới: bắt buộc phải có file ảnh
        // Khi chỉnh sửa: nếu không có file mới, đảm bảo đường dẫn ảnh cũ không trống.
        if (!isEditing && !form.image) { // Chế độ tạo mới, phải có file ảnh
            newErrors.images = "Vui lòng tải lên ảnh chính.";
        } else if (isEditing && !form.image && !form.old_image_path) { // Chế độ chỉnh sửa, không có file mới và không có ảnh cũ
            newErrors.images = "Vui lòng giữ lại ảnh cũ hoặc tải lên ảnh mới.";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, isEditing]); // Thêm isEditing vào dependency array

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Vui lòng điền đầy đủ và đúng thông tin!");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);
        setErrors({}); // Xóa lỗi cũ khi bắt đầu submit

        try {
            const fd = new FormData();

            // Thêm _method=PUT cho Laravel khi gửi FormData với PUT/PATCH request
            // (Quan trọng cho Laravel nhận diện đúng phương thức khi có file upload)
            if (isEditing) {
                fd.append("_method", "PUT");
            }

            // Append tất cả các trường dữ liệu thông thường vào FormData
            // Laravel sẽ parse các trường này từ FormData body
            Object.entries(form).forEach(([key, value]) => {
                // Bỏ qua các trường liên quan đến ảnh (đã xử lý riêng) và các trường không cần gửi
                if (["image", "old_image_path"].includes(key)) {
                    return;
                }

                // Xử lý các trường boolean
                if (key === "wheelchair_access") {
                    fd.append(key, value ? "1" : "0");
                }
                // Xử lý trường `note` nếu có, đổi tên thành `caption` theo backend
                else if (key === "note") { // Nếu Hotel có trường note và backend cần caption
                    fd.append("caption", value || "");
                }
                // Các trường khác, đảm bảo không null/undefined
                else if (value !== "" && value !== null && typeof value !== 'object') {
                    fd.append(key, value);
                }
            });

            // Xử lý ảnh chính ('images' field trong backend)
            // Ưu tiên file mới nếu có
            if (form.image instanceof File) {
                fd.append("images", form.image);
            } else if (form.old_image_path) {
                // Nếu không có file mới, nhưng có ảnh cũ, gửi lại đường dẫn tương đối của ảnh cũ
                // Điều chỉnh lại path để phù hợp với cách lưu của Laravel (ví dụ: 'uploads/hotels/ten_anh.jpg')
                const relativePath = form.old_image_path.replace("http://localhost:8000/storage/", "");
                fd.append("images", relativePath);
            } else {
                // Nếu không có cả file mới và ảnh cũ (tức là người dùng đã xóa ảnh cũ và không tải ảnh mới)
                // Gửi một chuỗi rỗng để báo hiệu Laravel xóa ảnh hoặc đặt null
                fd.append("images", ""); // Quan trọng: Đảm bảo field 'images' luôn được gửi, dù rỗng
            }


            const response = isEditing ? await updateHotel(hotelData.id, fd) : await createHotel(fd);
            alert(isEditing ? "Cập nhật thành công!" : "Tạo khách sạn thành công!");
            onSubmit(response.data);
        } catch (err) {
            console.error("Lỗi khi gửi yêu cầu:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                console.error("Lỗi Validation từ Server:", err.response.data.errors);
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                // Flatten lỗi từ mảng thành chuỗi đầu tiên để hiển thị dễ dàng
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                const errorMessages = Object.values(backendErrors).flat().join('\n');
                alert("Có lỗi validation:\n" + errorMessages);
            } else {
                alert("Có lỗi xảy ra, vui lòng kiểm tra lại! " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
            setForm((p) => ({ ...p, image: null })); // Reset file ảnh sau khi submit
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditing ? "Chỉnh sửa khách sạn" : "Thêm khách sạn mới"}
                </h1>
                <p className="text-sm text-gray-500">
                    {isEditing ? "Cập nhật thông tin khách sạn" : "Thêm thông tin khách sạn mới vào hệ thống"}
                </p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-hotel" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">
                            {isEditing ? "Cập nhật thông tin khách sạn" : "Bắt đầu điền thông tin khách sạn"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isEditing ? "Điền thông tin cần sửa và lưu lại" : "Điền đầy đủ thông tin để thêm khách sạn mới"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    {/* 1. Thông tin cơ bản */}
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input
                            name="name"
                            label={
                                <>
                                    Tên khách sạn <span className="text-red-500">*</span>
                                </>
                            }
                            placeholder="Nhập tên khách sạn..."
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

                        <Textarea
                            name="description"
                            label="Mô tả"
                            placeholder="Mô tả chi tiết về khách sạn..."
                            value={form.description}
                            onChange={handleChange}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}

                        <Input
                            name="address"
                            label={
                                <>
                                    Địa chỉ <span className="text-red-500">*</span>
                                </>
                            }
                            placeholder="Nhập địa chỉ chi tiết"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

                        {/* Tọa độ địa lý */}
                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-map-marker-alt" />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude === "" ? "" : parseFloat(form.latitude)}
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.latitude ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => setShowMap((s) => !s)}
                                >
                                    <i className="fas fa-map-marker-alt" />
                                </button>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={form.longitude === "" ? "" : parseFloat(form.longitude)}
                                    onChange={handleChange}
                                    placeholder="Kinh độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.longitude ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => {
                                        setForm((p) => ({ ...p, latitude: "", longitude: "" }));
                                        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể nhập trực tiếp tọa độ hoặc nhấn vào nút bản đồ để chọn vị trí
                            </p>
                            {showMap && (
                                <div className="overflow-hidden rounded-md border">
                                    <LocationSelectorMap
                                        initialLatitude={parseFloat(form.latitude) || 21.028511}
                                        initialLongitude={parseFloat(form.longitude) || 105.804817}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* 2. Thông tin liên hệ */}
                    <Section title="Thông tin liên hệ" icon="fas fa-phone-alt">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                name="phone"
                                label={
                                    <>
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </>
                                }
                                placeholder="Nhập số điện thoại..."
                                value={form.phone}
                                onChange={handleChange}
                            />
                            <Input
                                name="email"
                                label="Email"
                                placeholder="Nhập email..."
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            <div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="wheelchair_access"
                                        checked={form.wheelchair_access}
                                        onChange={handleChange}
                                    />
                                    Hỗ trợ xe lăn
                                </label>
                            </div>
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </Section>

                    {/* 3. Hình ảnh */}
                    <Section title="Hình ảnh" icon="fas fa-image">
                        {form.old_image_path && (
                            <div className="mb-4 space-y-2">
                                <Label text="Ảnh bìa hiện tại" />
                                <img
                                    src={form.old_image_path}
                                    alt="Ảnh bìa hiện tại"
                                    className="h-48 w-full rounded-md object-cover shadow-sm"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                        )}
                        <Label text="Ảnh chính mới (nếu thay đổi)" />
                        <DropZone
                            file={form.image || form.old_image_path} // Hiển thị file mới hoặc ảnh cũ
                            onRemove={removeImage} // Xóa cả file mới và đường dẫn cũ
                            onChange={handleFileChange}
                        />
                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}

                        {/* Các thành phần cho gallery (nếu Hotel model của bạn có gallery) */}
                        {/* Hiện tại Hotel model của bạn chỉ có 1 ảnh, nên phần này có thể bỏ qua */}
                        {/*
            {form.old_gallery && form.old_gallery.length > 0 && (
                <div className="space-y-2 pt-4">
                    <Label text="Ảnh thư viện hiện tại" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {form.old_gallery.map((img, idx) => (
                            img && (
                                <Thumb
                                    key={`old-${idx}`}
                                    src={img}
                                    onRemove={() => removeOldGallery(idx)}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2 pt-4">
                <Label text="Thêm ảnh thư viện mới" />
                {form.gallery.map((file, idx) => (
                    file && (
                        <div key={`new-${idx}`} className="flex items-center gap-3">
                            <Thumb
                                src={URL.createObjectURL(file)}
                                onRemove={() => removeGallery(idx)}
                                onReplace={(e) => handleFile(e, "gallery", idx)}
                            />
                            <button
                                type="button"
                                onClick={() => removeGallery(idx)}
                                className="flex-shrink-0 text-red-500 hover:text-red-700"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    )
                ))}
                <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, gallery: [...p.gallery, null] }))}
                    className="mt-2 flex items-center gap-1 rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600"
                >
                    <i className="fas fa-plus"></i> Thêm ảnh
                </button>
            </div>
            {errors.gallery && <p className="text-red-500 text-xs mt-1">{errors.gallery}</p>}
            */}
                    </Section>

                    {/* 4. Đánh giá */}
                    <Section title="Đánh giá" icon="fas fa-star" iconColor="text-yellow-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                name="rating"
                                label="Hạng đánh giá"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                placeholder="Nhập hạng đánh giá (0-5)"
                                value={form.rating}
                                onChange={handleChange}
                            />
                            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}

                            <Input
                                name="review_count"
                                label="Số lượng đánh giá"
                                type="number"
                                min="0"
                                placeholder="Nhập số lượng đánh giá"
                                value={form.review_count}
                                onChange={handleChange}
                            />
                        </div>
                    </Section>

                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md border px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Huỷ
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // Reset form về trạng thái ban đầu của hotelData hoặc initialForm
                                setForm(hotelData ? {
                                    ...initialForm,
                                    ...hotelData,
                                    latitude: hotelData.latitude ? String(hotelData.latitude) : "",
                                    longitude: hotelData.longitude ? String(hotelData.longitude) : "",
                                    old_image_path: hotelData.images ? `http://localhost:8000/storage/${hotelData.images}` : null,
                                    review_count: typeof hotelData.review_count === 'number' ? hotelData.review_count : 0,
                                } : initialForm);
                                setErrors({});
                                setShowMap(false); // Đặt lại trạng thái bản đồ
                            }}
                            className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo khách sạn"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ----------------------- Các component UI cơ bản (giữ nguyên hoặc điều chỉnh) ------------------------ */
// Các components Section, Label, Input, Textarea, Select, DropZone, Thumb, TimeInput
// Giữ nguyên như trong file edit.jsx của bạn, chỉ cần đảm bảo chúng được import hoặc định nghĩa ở đây.
// Tôi sẽ chỉ copy lại các component bạn đã cung cấp trong file `edit.jsx` nếu chúng chưa có sẵn trong `HotelEditForm.jsx`.

const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <i className={`${icon} ${iconColor}`} /> {title}
        </h2>
        {children}
    </section>
);

const Label = ({ text, icon, iconColor = "text-blue-500", className = "" }) => (
    <p
        className={`flex items-center text-sm font-medium text-gray-700 ${className}`}
    >
        {icon && <i className={`${icon} mr-2 ${iconColor}`} />} {text}
    </p>
);

const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step, className = "" }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            readOnly={readOnly}
            min={min}
            max={max}
            step={step}
            className={`w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
        />
    </div>
);

const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3 }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const Select = ({ label, options, ...rest }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <select
            {...rest}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

const DropZone = ({ file, onChange, onRemove }) => {
    const fileSrc = file instanceof File ? URL.createObjectURL(file) : file;
    return (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
            {file ? (
                <div className="group relative h-40 w-full">
                    <img
                        src={fileSrc}
                        alt="preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                        }}
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>
            ) : (
                <>
                    <i className="fas fa-cloud-upload-alt text-5xl text-gray-400" />
                    <p className="mt-3 text-sm text-gray-600">Kéo và thả ảnh vào đây hoặc</p>
                    <label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Duyệt ảnh từ thiết bị
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={onChange} className="hidden" />
                </>
            )}
        </div>
    );
};

// Thumb và TimeInput không cần thiết cho HotelForm vì bạn không quản lý gallery và giờ hoạt động ở đây.
// Nếu Hotel của bạn có các trường này, hãy thêm lại.

// const Thumb = ({ src, onRemove, onReplace }) => (
//     <div className="group relative aspect-video overflow-hidden rounded-md border">
//         <img src={src} alt="thumbnail" className="h-full w-full object-cover"
//             onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = "https://via.placeholder.com/100x70?text=Error";
//             }}
//         />
//         <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
//             {onReplace && (
//                 <label className="cursor-pointer rounded-full bg-blue-500 p-2 text-white">
//                     <i className="fas fa-pencil-alt text-xs" />
//                     <input type="file" accept="image/*" onChange={onReplace} className="hidden" />
//                 </label>
//             )}
//             <button type="button" onClick={onRemove} className="rounded-full bg-red-500 p-2 text-white">
//                 <i className="fas fa-trash-alt text-xs" />
//             </button>
//         </div>
//     </div>
// );

// const TimeInput = ({ label, value, onChange, name, required, disabled }) => (
//     <div className="space-y-1">
//         <Label text={label} />
//         <input
//             type="time"
//             name={name}
//             value={value}
//             onChange={onChange}
//             required={required}
//             disabled={disabled}
//             className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
//         />
//     </div>
// );