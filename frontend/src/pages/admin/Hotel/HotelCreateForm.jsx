import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel } from "../../../services/ui/Hotel/hotelService";
import LocationSelectorMap from '../../../common/LocationSelectorMap';

// Khởi tạo form với các giá trị mặc định, loại bỏ các trường không có trong HotelController::store
const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    images: null, // Đổi tên từ 'image' thành 'images' để khớp với backend
    rating: "",
    phone: "",
    email: "",
    review_count: 0, // Thêm lại review_count nếu bị mất, có trong HotelController
    wheelchair_access: false, // Thêm lại wheelchair_access nếu bị mất, có trong HotelController
};

export default function HotelCreate({ onCancel, onSubmit }) {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* -------------------------- Các hàm xử lý thay đổi form --------------------------- */

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        // 2. Determine the correct value based on input type
        let finalValue = value;
        if (type === "number") {
            // Giữ giá trị là chuỗi cho input, chỉ parse sang số khi gửi dữ liệu hoặc validate
            finalValue = value;
        } else if (type === "checkbox") {
            finalValue = checked;
        }

        // 3. Update the form state with the new value
        setForm((prevForm) => ({ ...prevForm, [name]: finalValue }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    }, []); // Dependencies are empty as it only depends on setErrors and setForm from props/hooks, which are stable.

    // Xử lý thay đổi cho input file (Chỉ xử lý ảnh chính 'images')
    const handleFile = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp ảnh hợp lệ.");
            setForm((p) => ({ ...p, images: null })); // Reset file nếu không hợp lệ
            return;
        }
        setForm((p) => ({ ...p, images: file })); // Lưu file ảnh mới
        setErrors((p) => ({ ...p, images: undefined })); // Xóa lỗi ảnh
    }, []);

    // Xử lý xóa ảnh chính
    const removeImage = useCallback(() => {
        setForm((p) => ({ ...p, images: null }));
        setErrors((p) => ({ ...p, images: undefined }));
    }, []);

    // Hàm callback từ LocationSelectorMap để cập nhật latitude/longitude
    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";
        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
    }, []);

    /* --------------------------- Xác thực và Gửi Form --------------------------- */

    // Hàm xác thực phía client
    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Tên khách sạn không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (form.latitude === "" || form.longitude === "" || isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
            newErrors.latitude = "Vĩ độ và kinh độ không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không hợp lệ.";
        }
        if (form.rating && (isNaN(parseFloat(form.rating)) || parseFloat(form.rating) < 0 || parseFloat(form.rating) > 5)) {
            newErrors.rating = "Đánh giá phải từ 0 đến 5 sao.";
        }
        if (!form.phone.trim()) {
            newErrors.phone = "Số điện thoại không được để trống.";
        }
        if (!form.images) {
            newErrors.images = "Vui lòng tải lên ảnh chính.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const fd = new FormData();

            // Thêm các trường vào FormData
            Object.entries(form).forEach(([k, v]) => {
                // Xử lý riêng trường ảnh chính 'images'
                if (k === "images" && v instanceof File) {
                    fd.append("images", v);
                }
                // Xử lý boolean wheelchair_access
                else if (k === "wheelchair_access") {
                    fd.append(k, v ? "1" : "0");
                }
                // Bỏ qua các trường không cần gửi hoặc đã xử lý riêng
                else if (v !== "" && v !== null && typeof v !== 'object') {
                    fd.append(k, v);
                }
            });

            // Gửi yêu cầu tạo khách sạn
            await createHotel(fd);

            alert("Tạo khách sạn thành công!");
            navigate("/admin/hotels");
        } catch (err) {
            console.error("Lỗi tạo khách sạn:", err.response?.data || err.message);
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                const errorMessages = Object.values(backendErrors).flat().join('\n');
                alert("Có lỗi xảy ra:\n" + errorMessages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Có lỗi, kiểm tra console để biết chi tiết: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
            setForm((p) => ({ ...p, images: null })); // Reset file ảnh sau khi submit
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm khách sạn mới</h1>
                <p className="text-sm text-gray-500">Thêm thông tin khách sạn mới vào hệ thống</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-hotel" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Bắt đầu điền thông tin khách sạn</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm khách sạn mới</p>
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
                            required
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
                            label="Địa chỉ"
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
                                    value={form.latitude} // Thay đổi để giữ nguyên giá trị chuỗi
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`w-full rounded-md border p-2 text-sm bg-white shadow-sm ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}

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
                                    value={form.longitude}
                                    onChange={handleChange}
                                    placeholder="Kinh độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
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
                        <Label text="Ảnh chính" />
                        <DropZone
                            file={form.images}
                            onRemove={removeImage}
                            onChange={handleFile}
                        />
                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                    </Section>

                    {/* 5. Đánh giá */}
                    <Section title="Đánh giá" icon="fas fa-star" iconColor="text-yellow-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Select
                                    name="rating"
                                    label="Hạng đánh giá"
                                    value={form.rating}
                                    onChange={handleChange}
                                    options={[
                                        { value: "", label: "--Chọn hạng đánh giá--" },
                                        { value: "5", label: "★★★★★" },
                                        { value: "4", label: "★★★★☆" },
                                        { value: "3", label: "★★★☆☆" },
                                        { value: "2", label: "★★☆☆☆" },
                                        { value: "1", label: "★☆☆☆☆" },
                                        { value: "0", label: "Chưa đánh giá" },
                                    ]}
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
                                    className="mt-4"
                                />
                            </div>
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
                            onClick={() => { setForm(initialForm); setErrors({}); }}
                            className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu khách sạn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ----------------------- UI primitives (Các component UI cơ bản) ------------------------ */
const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <i className={`${icon} ${iconColor}`} /> {title}
        </h2>
        {children}
    </section>
);

const Label = ({ text, icon, iconColor = "text-blue-500", className = "" }) => (
    <p className={`flex items-center text-sm font-medium text-gray-700 ${className}`}>
        {icon && <i className={`${icon} mr-2 ${iconColor}`} />} {text}
    </p>
);

const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step }) => (
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
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
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