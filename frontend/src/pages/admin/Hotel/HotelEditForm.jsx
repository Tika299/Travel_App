import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel, updateHotel } from "../../../services/ui/Hotel/hotelService";
import { fetchLocations } from "../../../services/ui/Location/locationService";
import LocationSelectorMap from "../../../common/LocationSelectorMap";

const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
    old_image: null,
    rating: "",
    phone: "",
    email: "",
    website: "",
    price_range: "",
    amenities: [],
    policies: "",
    check_in_time: "14:00",
    check_out_time: "12:00",
    gallery: [],
    old_gallery: [],
    location_id: "",
    status: "active",
    note: "",
};

export default function HotelForm({ hotelData, onCancel, onSubmit }) {
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [locations, setLocations] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing] = useState(!!hotelData);

    // Danh sách tiện ích khách sạn
    const amenityOptions = [
        { value: "wifi", label: "Wi-Fi miễn phí" },
        { value: "parking", label: "Bãi đậu xe" },
        { value: "pool", label: "Hồ bơi" },
        { value: "gym", label: "Phòng gym" },
        { value: "spa", label: "Spa" },
        { value: "restaurant", label: "Nhà hàng" },
        { value: "bar", label: "Quầy bar" },
        { value: "airport_shuttle", label: "Đưa đón sân bay" },
        { value: "concierge", label: "Dịch vụ lễ tân" },
        { value: "laundry", label: "Dịch vụ giặt ủi" },
    ];

    // Khởi tạo form với dữ liệu khách sạn nếu là chế độ chỉnh sửa
    useEffect(() => {
        const fetchData = async () => {
            try {
                const locationsResponse = await fetchLocations();
                if (Array.isArray(locationsResponse)) {
                    setLocations(locationsResponse);
                } else if (locationsResponse && Array.isArray(locationsResponse.data)) {
                    setLocations(locationsResponse.data);
                } else {
                    console.error("Unexpected API response for locations:", locationsResponse);
                    setLocations([]);
                }

                if (hotelData) {
                    // Xử lý dữ liệu khách sạn cho chế độ chỉnh sửa
                    const getImageUrl = (path) => {
                        if (!path) return null;
                        if (path.startsWith("http://") || path.startsWith("https://")) {
                            return path;
                        }
                        return `http://localhost:8000/storage/${path}`;
                    };
                    console.log("Chỉnh sửa khách sạn:", hotelData);

                    setForm({
                        ...initialForm,
                        ...hotelData,
                        old_image: hotelData.images,
                        old_gallery: hotelData.images ? "" : [],
                        amenities: hotelData.amenities || [],
                        check_in_time: hotelData.check_in_time || "14:00",
                        check_out_time: hotelData.check_out_time || "12:00",
                    });

                    if (hotelData.latitude && hotelData.longitude) {
                        setShowMap(true);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                alert("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
            }
        };
        fetchData();
    }, [hotelData]);

    /* -------------------------- Các hàm xử lý thay đổi form --------------------------- */

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;

        if (name === 'location_id' && value === '') {
            finalValue = null;
        } else if (type === "number") {
            finalValue = value === "" ? "" : parseFloat(value);
        } else if (type === "checkbox") {
            finalValue = checked;
        }

        setForm((p) => ({ ...p, [name]: finalValue }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    }, []);

    const handleAmenityChange = useCallback((e) => {
        const { value, checked } = e.target;
        setForm(prev => {
            const newAmenities = checked
                ? [...prev.amenities, value]
                : prev.amenities.filter(a => a !== value);
            return { ...prev, amenities: newAmenities };
        });
    }, []);

    const handleFile = useCallback((e, field, index = null) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp ảnh hợp lệ.");
            return;
        }

        if (field === "image") {
            setForm((p) => ({ ...p, image: file }));
            setErrors((p) => ({ ...p, image: undefined }));
        } else if (field === "gallery") {
            const nextGallery = [...form.gallery];
            if (index === null) {
                nextGallery.push(file);
            } else {
                nextGallery[index] = file;
            }
            setForm((p) => ({ ...p, gallery: nextGallery }));
            setErrors((p) => ({ ...p, gallery: undefined }));
        }
    }, [form.gallery]);

    const removeGallery = useCallback((idx) => {
        setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
        setErrors((p) => ({ ...p, gallery: undefined }));
    }, []);

    const removeOldGallery = useCallback((idx) => {
        setForm((p) => ({
            ...p,
            old_gallery: p.old_gallery.filter((_, i) => i !== idx),
        }));
        setErrors((p) => ({ ...p, old_gallery: undefined }));
    }, []);

    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";

        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
    }, []);

    /* --------------------------- Xác thực và Gửi Form --------------------------- */

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Tên khách sạn không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (!form.location_id) {
            newErrors.location_id = "Vui lòng chọn thành phố.";
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
        if (!form.old_image && !form.image) {
            newErrors.image = "Vui lòng tải lên ảnh chính.";
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
                if (k === "image" && v) {
                    fd.append("image", v);
                } else if (k === "gallery") {
                    v.forEach((f, i) => f && fd.append(`images[${i}]`, f));
                } else if (k === "amenities") {
                    fd.append('amenities', JSON.stringify(v));
                } else if (k === "note") {
                    if (v) fd.append("caption", v);
                } else if (v !== "" && v !== null) {
                    fd.append(k, v);
                }
            });

            // Thêm old_images nếu là chế độ chỉnh sửa
            if (isEditing && form.old_gallery) {
                form.old_gallery.forEach((img) => {
                    if (img && img.includes("storage/")) {
                        const path = img.split("storage/")[1];
                        fd.append("old_images[]", path);
                    }
                });
            }

            // Gửi yêu cầu tạo/cập nhật khách sạn
            const response = isEditing 
                ? await updateHotel(hotelData.id, fd)
                : await createHotel(fd);

            alert(isEditing ? "Cập nhật khách sạn thành công!" : "Tạo khách sạn thành công!");
            onSubmit(response.data);
        } catch (err) {
            console.error("Lỗi:", err.response?.data || err.message);
            if (err.response?.data?.errors) {
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                alert("Có lỗi xảy ra. Vui lòng kiểm tra lại các trường bị lỗi.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Có lỗi, kiểm tra console để biết chi tiết: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
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

                        {/* Selector cho Thành phố */}
                        <Select
                            name="location_id"
                            label={
                                <>
                                    Thành phố <span className="text-red-500">*</span>
                                </>
                            }
                            value={form.location_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "", label: "--Chọn thành phố--" },
                                ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
                            ]}
                        />
                        {errors.location_id && <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>}

                        {/* Tọa độ địa lý */}
                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-map-marker-alt" />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
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
                            <Input
                                name="website"
                                label="Website"
                                placeholder="Nhập website..."
                                value={form.website}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </Section>

                    {/* 3. Hình ảnh */}
                    <Section title="Hình ảnh" icon="fas fa-image">
                        {isEditing && form.old_image && (
                            <div className="mb-4 space-y-2">
                                <Label text="Ảnh bìa hiện tại" />
                                <img
                                    src={form.old_image}
                                    alt="Ảnh bìa hiện tại"
                                    className="h-48 w-full rounded-md object-cover shadow-sm"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                        )}
                        <Label text={isEditing ? "Ảnh chính mới (nếu thay đổi)" : "Ảnh chính"} />
                        <DropZone
                            file={form.image || form.old_image}
                            onRemove={() => setForm((p) => ({ ...p, image: null, old_image: null }))}
                            onChange={(e) => handleFile(e, "image")}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

                        {isEditing && form.old_gallery && form.old_gallery.length > 0 && (
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
                            <Label text={isEditing ? "Thêm ảnh thư viện mới" : "Thư viện ảnh"} />
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
                    </Section>

                    {/* 4. Tiện nghi & Chính sách */}
                    <Section title="Tiện nghi & Chính sách" icon="fas fa-umbrella-beach">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label text="Tiện nghi" icon="fas fa-concierge-bell" />
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {amenityOptions.map((amenity) => (
                                        <label key={amenity.value} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                value={amenity.value}
                                                checked={form.amenities.includes(amenity.value)}
                                                onChange={handleAmenityChange}
                                            />
                                            {amenity.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <Label text="Chính sách" icon="fas fa-clipboard-list" />
                                <Textarea
                                    name="policies"
                                    placeholder="Nhập các chính sách của khách sạn..."
                                    value={form.policies}
                                    onChange={handleChange}
                                    rows={5}
                                />
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <Input
                                        name="check_in_time"
                                        label="Giờ nhận phòng"
                                        type="time"
                                        value={form.check_in_time}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        name="check_out_time"
                                        label="Giờ trả phòng"
                                        type="time"
                                        value={form.check_out_time}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 5. Đánh giá & Trạng thái */}
                    <Section title="Đánh giá & Trạng thái" icon="fas fa-star" iconColor="text-yellow-500">
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
                                
                                <Select
                                    name="price_range"
                                    label="Mức giá"
                                    value={form.price_range}
                                    onChange={handleChange}
                                    className="mt-4"
                                    options={[
                                        { value: "", label: "--Chọn mức giá--" },
                                        { value: "budget", label: "Bình dân" },
                                        { value: "midrange", label: "Tầm trung" },
                                        { value: "luxury", label: "Cao cấp" },
                                    ]}
                                />
                            </div>
                            
                            <div className="md:border-l md:pl-6">
                                <Select
                                    name="status"
                                    label="Trạng thái"
                                    value={form.status}
                                    onChange={handleChange}
                                    options={[
                                        { value: "active", label: "Đang hoạt động" },
                                        { value: "inactive", label: "Ngừng hoạt động" },
                                        { value: "draft", label: "Bản nháp" },
                                    ]}
                                />
                                
                                <Textarea
                                    name="note"
                                    label="Ghi chú"
                                    placeholder="Thêm ghi chú..."
                                    value={form.note}
                                    onChange={handleChange}
                                    className="mt-4"
                                    rows={3}
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
                            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo khách sạn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ----------------------- Các component UI cơ bản ------------------------ */
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

const Thumb = ({ src, onRemove, onReplace }) => (
    <div className="group relative aspect-video overflow-hidden rounded-md border">
        <img src={src} alt="thumbnail" className="h-full w-full object-cover"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100x70?text=Error";
            }}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
            {onReplace && (
                <label className="cursor-pointer rounded-full bg-blue-500 p-2 text-white">
                    <i className="fas fa-pencil-alt text-xs" />
                    <input type="file" accept="image/*" onChange={onReplace} className="hidden" />
                </label>
            )}
            <button type="button" onClick={onRemove} className="rounded-full bg-red-500 p-2 text-white">
                <i className="fas fa-trash-alt text-xs" />
            </button>
        </div>
    </div>
);