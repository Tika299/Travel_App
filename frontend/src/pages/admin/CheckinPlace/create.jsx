import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckinPlace } from "../../../services/ui/CheckinPlace/checkinPlaceService.js";
import { fetchLocations } from "../../../services/ui/Location/locationService.js";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService.js";
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx'; // 

// Khởi tạo form với các giá trị mặc định
const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "", // Sẽ lưu trữ dưới dạng chuỗi hoặc số
    longitude: "", // Sẽ lưu trữ dưới dạng chuỗi hoặc số
    image: null, // File ảnh chính
    price: "",
    is_free: false,
    start_time: "",
    end_time: "",
    all_day: false,
    transport: "", // Sẽ là một string, sau đó chuyển thành mảng transport_options
    status: "active",
    note: "", // Sẽ là caption ở backend
    gallery: [], // Mảng các file ảnh phụ
    location_id: "",
    region: "", // THÊM TRƯỜNG 'region' VÀO ĐÂY VÀ ĐẶT GIÁ TRỊ MẶC ĐỊNH LÀ CHUỖI RỖNG
};

export default function CreateCheckinPlace() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false); // State để bật/tắt hiển thị bản đồ
    const [locations, setLocations] = useState([]);
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Các lựa chọn cho trường 'region'
    const regionOptions = [
        { value: "", label: "--Chọn miền/khu vực--" },
        { value: " Bắc", label: "Miền Bắc" },
        { value: " Trung", label: "Miền Trung" },
        { value: " Nam", label: "Miền Nam" },
    ];

    // Effect để fetch danh sách thành phố và loại phương tiện khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Locations
                const locationsResponse = await fetchLocations();
                if (Array.isArray(locationsResponse)) {
                    setLocations(locationsResponse);
                } else if (locationsResponse && Array.isArray(locationsResponse.data)) {
                    setLocations(locationsResponse.data);
                } else {
                    console.error("Unexpected API response for locations:", locationsResponse);
                    setLocations([]);
                }

                // Fetch Transportation Types
                const transportResponse = await getAllTransportations();
                if (transportResponse && transportResponse.data && Array.isArray(transportResponse.data.data)) {
                    setTransportationTypes(transportResponse.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", transportResponse);
                    setTransportationTypes([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                alert("Không thể tải dữ liệu cần thiết (thành phố, phương tiện). Vui lòng thử lại.");
            }
        };
        fetchData();
    }, []);

    /* -------------------------- Các hàm xử lý thay đổi form --------------------------- */

    // Xử lý thay đổi cho các input thông thường (text, number, select, checkbox)
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;

        if (name === 'location_id' && value === '') {
            finalValue = null; // Đặt null nếu chọn "Chọn thành phố"
        } else if (type === "number") {
            // Chuyển đổi sang số, nhưng cho phép chuỗi rỗng nếu người dùng xóa hết số
            finalValue = value === "" ? "" : parseFloat(value);
        } else if (type === "checkbox") {
            finalValue = checked;
        }

        setForm((p) => ({ ...p, [name]: finalValue }));
        // Xóa lỗi cho trường hiện tại khi người dùng bắt đầu nhập
        setErrors((p) => ({ ...p, [name]: undefined }));
    }, []);

    // Xử lý thay đổi cho input file (ảnh chính và gallery)
    const handleFile = useCallback((e, field, index = null) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp ảnh hợp lệ.");
            return;
        }

        if (field === "image") {
            setForm((p) => ({ ...p, image: file }));
            setErrors((p) => ({ ...p, image: undefined })); // Xóa lỗi ảnh chính
        } else if (field === "gallery") {
            const nextGallery = [...form.gallery];
            if (index === null) { // Thêm ảnh mới vào gallery
                nextGallery.push(file);
            } else { // Thay thế ảnh trong gallery
                nextGallery[index] = file;
            }
            setForm((p) => ({ ...p, gallery: nextGallery }));
            setErrors((p) => ({ ...p, gallery: undefined })); // Xóa lỗi gallery
        }
    }, [form.gallery]);

    // Xử lý xóa ảnh khỏi gallery
    const removeGallery = useCallback((idx) => {
        setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
        setErrors((p) => ({ ...p, gallery: undefined })); // Xóa lỗi gallery khi xóa ảnh
    }, []);

    // Hàm callback từ LocationSelectorMap để cập nhật latitude/longitude
    const handleLocationSelect = useCallback((lat, lng) => {
        // Đảm bảo rằng lat và lng là số trước khi làm tròn và cập nhật state
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";

        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined })); // Xóa lỗi tọa độ
        // alert(`Đã chọn tọa độ: Vĩ độ ${newLat}, Kinh độ ${newLng}`); // Thông báo đơn giản
    }, []);

    /* --------------------------- Xác thực và Gửi Form --------------------------- */

    // Hàm xác thực phía client
    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = "Tên địa điểm không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (!form.location_id) {
            newErrors.location_id = "Vui lòng chọn thành phố.";
        }
        // Kiểm tra latitude và longitude: phải là chuỗi không rỗng và có thể chuyển đổi thành số hợp lệ
        if (form.latitude === "" || form.longitude === "" || isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
            newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
        }
        // Removed rating validation as it's not in the DB
        if (!form.is_free && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)) {
            newErrors.price = "Giá phải là một số không âm.";
        }
        if (!form.all_day) {
            if (!form.start_time) {
                newErrors.start_time = "Giờ mở cửa không được để trống.";
            }
            if (!form.end_time) {
                newErrors.end_time = "Giờ đóng cửa không được để trống.";
            }
            if (form.start_time && form.end_time && form.start_time >= form.end_time) {
                newErrors.end_time = "Giờ đóng cửa phải sau giờ mở cửa.";
            }
        }
        if (!form.image) {
            newErrors.image = "Vui lòng tải lên ảnh chính.";
        }
        // if (form.gallery.length === 0) {
        //     newErrors.gallery = "Vui lòng tải lên ít nhất một ảnh thư viện.";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 1. Thực hiện xác thực phía client
        if (!validateForm()) {
            alert("Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!");
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu form để người dùng thấy lỗi
            return;
        }

        setIsSubmitting(true); // Bắt đầu trạng thái gửi form
        setErrors({}); // Xóa lỗi cũ trước khi gửi

        try {
            const fd = new FormData();
            // Thêm các trường vào FormData
            Object.entries(form).forEach(([k, v]) => {
                if (k === "image" && v) {
                    fd.append("image", v); // Thêm file ảnh chính
                } else if (k === "gallery") {
                    v.forEach((f, i) => f && fd.append(`images[${i}]`, f)); // Thêm các file ảnh gallery
                } else if (k === "start_time" || k === "end_time" || k === "all_day") {
                    // Các trường này sẽ được xử lý riêng cho operating_hours
                } else if (k === "transport") {
                    // transport_options là một mảng string ở backend
                    if (v) fd.append('transport_options', JSON.stringify([v]));
                    else fd.append('transport_options', JSON.stringify([]));
                } else if (k === "is_free") {
                    fd.append("is_free", v ? "1" : "0"); // Chuyển boolean thành "1" hoặc "0"
                } else if (k === "note") {
                    if (v !== "" && v !== null) fd.append("caption", v); // Đổi 'note' thành 'caption' cho backend
                } else if (v !== "" && v !== null) {
                    fd.append(k, v); // Các trường thông thường khác
                }
            });

            // Thêm operating_hours (đối tượng JSON)
            const operatingHours = {
                all_day: form.all_day,
                open: form.all_day ? null : form.start_time,
                close: form.all_day ? null : form.end_time,
            };
            fd.append('operating_hours', JSON.stringify(operatingHours)); // Gửi dưới dạng JSON string

            // Gửi yêu cầu tạo địa điểm
            await createCheckinPlace(fd);
            alert("✅ Tạo địa điểm thành công!"); // Thông báo thành công đơn giản
            // triggerDataRefresh(); // Kích hoạt sự kiện đồng bộ dữ liệu cho các tab khác (nếu có)
            navigate("/admin/checkin-places"); // Điều hướng về trang danh sách
        } catch (err) {
            console.error("Lỗi tạo địa điểm:", err.response?.data || err.message);
            // Xử lý lỗi từ Backend (Server-side Validation Errors hoặc lỗi khác)
            if (err.response && err.response.data && err.response.data.errors) {
                // Laravel validation errors thường có dạng { field: ["error message"], another_field: ["another error"] }
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0]; // Lấy lỗi đầu tiên cho mỗi trường
                    }
                }
                setErrors(formattedErrors); // Cập nhật state errors với lỗi từ backend
                alert("❌ Có lỗi xảy ra. Vui lòng kiểm tra lại các trường bị lỗi."); // Thông báo lỗi đơn giản
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu để người dùng thấy lỗi
            } else {
                alert("❌ Có lỗi, kiểm tra console để biết chi tiết: " + (err.response?.data?.message || err.message)); // Thông báo lỗi đơn giản
            }
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái gửi form
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm điểm check‑in mới</h1>
                <p className="text-sm text-gray-500">Thêm những điểm check‑in ấn tượng với người dùng</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-map-marker-alt" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Bắt đầu điền thông tin điểm check‑in</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm điểm check‑in mới</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    {/* 1. Thông tin cơ bản */}
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input
                            name="name"
                            label={
                                <>
                                    Tên địa điểm check‑in <span className="text-red-500">*</span>
                                </>
                            }
                            placeholder="Nhập tên địa điểm...."
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        <Textarea
                            name="description"
                            label="Mô tả"
                            placeholder="Mô tả chi tiết về địa điểm...."
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

                        {/* Input cho trường 'region' đã được thay bằng Select */}
                        <Select
                            name="region"
                            label="Miền / Khu vực"
                            value={form.region}
                            onChange={handleChange}
                            options={regionOptions} // Sử dụng options đã định nghĩa
                        />
                        {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}

                        {/* Selector cho Thành phố (Location_id) */}
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
                                    value={form.latitude === "" ? "" : parseFloat(form.latitude)} // Hiển thị số hoặc rỗng
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => setShowMap((s) => !s)} // Nút bật/tắt bản đồ
                                >
                                    <i className="fas fa-map-marker-alt" />
                                </button>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={form.longitude === "" ? "" : parseFloat(form.longitude)} // Hiển thị số hoặc rỗng
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
                                        alert("Đã đặt lại tọa độ về rỗng."); // Thông báo đơn giản
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (
                                <i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ.
                                Sau khi chọn trên bản đồ, tọa độ sẽ tự động hiển thị tại đây.
                            </p>
                            {showMap && (
                                <div className="overflow-hidden rounded-md border">
                                    <LocationSelectorMap
                                        // Truyền tọa độ hiện tại của form vào bản đồ làm vị trí ban đầu
                                        initialLatitude={parseFloat(form.latitude) || 21.028511} // Mặc định Hà Nội nếu chưa có
                                        initialLongitude={parseFloat(form.longitude) || 105.804817} // Mặc định Hà Nội nếu chưa có
                                        onLocationSelect={handleLocationSelect} // <-- Hàm callback để nhận tọa độ từ bản đồ
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* 2. Hình ảnh */}
                    <Section title="Hình ảnh" icon="fas fa-image">
                        <Label text="Ảnh chính" />
                        <DropZone
                            file={form.image}
                            onRemove={() => {
                                setForm((p) => ({ ...p, image: null }));
                                setErrors((p) => ({ ...p, image: undefined }));
                            }}
                            onChange={(e) => handleFile(e, "image")}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        <Label text="Thư viện ảnh" className="mt-6" />
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {form.gallery.map((img, i) => (
                                img && (
                                    <Thumb
                                        key={i}
                                        src={URL.createObjectURL(img)}
                                        onRemove={() => removeGallery(i)}
                                        onReplace={(e) => handleFile(e, "gallery", i)}
                                    />
                                )
                            ))}
                            <label
                                type="button"
                                className="flex aspect-video cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-500"
                            >
                                <i className="fas fa-plus text-2xl" />
                                <input type="file" accept="image/*" onChange={(e) => handleFile(e, "gallery", null)} className="hidden" />
                            </label>
                        </div>
                        {errors.gallery && <p className="text-red-500 text-xs mt-1">{errors.gallery}</p>}
                    </Section>

                    {/* 3. Giá cả */}
                    {/* Removed "Đánh giá" section as `rating` is not in the DB */}
                    <Section title="Giá cả" icon="fas fa-dollar-sign" iconColor="text-green-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* trái - Operating Hours */}
                            <div className="space-y-6">
                                {/* Giờ hoạt động */}
                                <div className="space-y-3">
                                    <Label text="Giờ hoạt động" icon="fas fa-clock" iconColor="text-blue-500" />
                                    <div className="flex gap-3">
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={form.start_time}
                                            onChange={handleChange}
                                            className={`flex-1 rounded-md border p-2 text-sm ${errors.start_time ? 'border-red-500' : 'border-gray-300'}`}
                                            disabled={form.all_day}
                                            required={!form.all_day}
                                        />
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={form.end_time}
                                            onChange={handleChange}
                                            className={`flex-1 rounded-md border p-2 text-sm ${errors.end_time ? 'border-red-500' : 'border-gray-300'}`}
                                            disabled={form.all_day}
                                            required={!form.all_day}
                                        />
                                    </div>
                                    {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                                    {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="all_day" checked={form.all_day} onChange={handleChange} /> Tất cả thời gian
                                    </label>
                                </div>
                            </div>

                            {/* phải – có border‑l trên màn hình lớn */}
                            <div className="space-y-6 md:border-l md:pl-6">
                                {/* Giá */}
                                <div className="space-y-2">
                                    <Label text="Giá (VND)" />
                                    <div className="flex items-center gap-6 text-sm">
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="price_type"
                                                checked={!form.is_free}
                                                onChange={() => setForm((p) => ({ ...p, is_free: false, price: "" }))}
                                            />
                                            Có phí
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="price_type"
                                                checked={form.is_free}
                                                onChange={() => setForm((p) => ({ ...p, is_free: true, price: "0" }))}
                                            />
                                            Miễn phí
                                        </label>
                                    </div>
                                    {!form.is_free && (
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            className={`w-full rounded-md border p-2 text-sm ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                            min="0"
                                        />
                                    )}
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>

                                {/* Phương tiện di chuyển */}
                                <div className="space-y-2">
                                    <Label text="Phương tiện di chuyển" icon="fas fa-car" iconColor="text-cyan-500" />
                                    <Select
                                        name="transport"
                                        value={form.transport}
                                        onChange={handleChange}
                                        options={[
                                            { value: "", label: "--Chọn phương tiện--" },
                                            ...transportationTypes.map((type) => ({ value: type.name, label: type.name })),
                                        ]}
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                    />
                                    {errors.transport && <p className="text-red-500 text-xs mt-1">{errors.transport}</p>}
                                </div>

                                {/* Trạng thái */}
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
                                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                            </div>
                        </div>
                    </Section>

                    {/* 4. Ghi chú */}
                    <Section title="Ghi chú" icon="fas fa-sticky-note" iconColor="text-gray-600">
                        <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Thêm ghi chú..."
                            rows={3}
                            className={`w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${errors.note ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
                    </Section>

                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-md border px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Huỷ
                        </button>
                        <button
                            type="button"
                            onClick={() => { setForm(initialForm); setErrors({}); alert("Đã đặt lại form."); }} // Đặt lại lỗi khi reset form
                            className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi form
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu điểm check‑in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ----------------------- UI primitives (Các component UI cơ bản) ------------------------ */
// Các component này được định nghĩa ở cuối file để tiện quản lý,
// hoặc bạn có thể đặt chúng trong các file riêng biệt và import vào.
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
const DropZone = ({ file, onChange, onRemove }) => (
    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
        {file ? (
            <div className="group relative h-40 w-full">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
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
const Thumb = ({ src, onRemove, onReplace }) => (
    <div className="group relative aspect-video overflow-hidden rounded-md border">
        <img src={src} alt="thumbnail" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
            <label className="cursor-pointer rounded-full bg-blue-500 p-2 text-white">
                <i className="fas fa-pencil-alt text-xs" />
                <input type="file" accept="image/*" onChange={onReplace} className="hidden" />
            </label>
            <button type="button" onClick={onRemove} className="rounded-full bg-red-500 p-2 text-white">
                <i className="fas fa-trash-alt text-xs" />
            </button>
        </div>
    </div>
);