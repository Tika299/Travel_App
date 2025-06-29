import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Đã điều chỉnh đường dẫn import cho các dịch vụ và component
import { createCheckinPlace } from "../../../services/ui/CheckinPlace/checkinPlaceService.js";
import { fetchLocations } from "../../../services/ui/Location/locationService.js";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService.js"; 
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx'; // Đã thêm import cho LocationSelectorMap và đảm bảo có .jsx

// Giả định các component UI như Section, Label, Input, Textarea, Select, DropZone, Thumb đã được định nghĩa
// ở ngoài hoặc trong một file riêng và được import vào đây.
// Để cho gọn, tôi sẽ định nghĩa lại chúng ở cuối file này nếu chúng không được cung cấp đầy đủ.

/**
 * CreateCheckinPlace – giao diện thêm điểm check‑in mới (phiên bản bám sát mock‑up).
 * - Tailwind CSS cho layout (mobile first, desktop 2 cột).
 * - shadcn/ui / lucide‑react có sẵn (không import thêm để tránh rườm rà, icon dùng FontAwesome).
 */

const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
    rating: "",
    price: "",
    is_free: false,
    start_time: "", // Sẽ gộp vào operating_hours
    end_time: "",   // Sẽ gộp vào operating_hours
    all_day: false, // Sẽ gộp vào operating_hours
    transport: "", // Sẽ gộp vào transport_options, giờ sẽ là ID hoặc tên
    status: "active",
    note: "",
    gallery: [],
    location_id: "",
};

export default function CreateCheckinPlace() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [locations, setLocations] = useState([]);
    const [transportationTypes, setTransportationTypes] = useState([]); // <-- State mới cho loại phương tiện

    // Effect để fetch danh sách thành phố khi component được mount
    useEffect(() => {
        const getLocations = async () => {
            try {
                const response = await fetchLocations();
                if (Array.isArray(response)) {
                    setLocations(response);
                } else if (response && Array.isArray(response.data)) {
                    setLocations(response.data);
                } else {
                    console.error("Unexpected API response for locations:", response);
                    setLocations([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách thành phố:", error);
                alert("Không thể tải danh sách thành phố.");
            }
        };
        getLocations();
    }, []);

    // Effect mới để fetch danh sách loại phương tiện khi component được mount
    useEffect(() => {
        const getTransportationTypes = async () => {
            try {
                const response = await getAllTransportations(); // Gọi hàm từ service mới
                if (response && response.data && Array.isArray(response.data.data)) {
                    setTransportationTypes(response.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", response);
                    setTransportationTypes([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách loại phương tiện:", error);
                alert("Không thể tải danh sách loại phương tiện.");
            }
        };
        getTransportationTypes();
    }, []);

    /* -------------------------- helpers --------------------------- */
    const handleChange = useCallback((e) => { // Sử dụng useCallback
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'location_id' && value === '' ? null : value;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : finalValue }));
    }, []);

    const handleFile = useCallback((e, field, i = null) => { // Sử dụng useCallback
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        if (field === "image") setForm((p) => ({ ...p, image: file }));
        else if (field === "gallery") { // `gallery` trên frontend tương ứng với `images` trên backend
            const next = [...form.gallery];
            if (i === null) next.push(file);
            else next[i] = file;
            setForm((p) => ({ ...p, gallery: next }));
        }
    }, [form.gallery]); // Dependency array cho useCallback

    const removeGallery = useCallback((idx) => setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) })), []); // Sử dụng useCallback

    const handleLocation = useCallback((lat, lng) => { // Sử dụng useCallback
        setForm((p) => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    }, []);

    /* --------------------------- submit --------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();

            // Thêm các trường vào FormData
            Object.entries(form).forEach(([k, v]) => {
                // Xử lý ảnh chính
                if (k === "image" && v) {
                    fd.append("image", v);
                } 
                // Xử lý gallery ảnh (backend mong đợi `images[]`)
                else if (k === "gallery") {
                    v.forEach((f, i) => f && fd.append(`images[${i}]`, f));
                }
                // Bỏ qua start_time, end_time, all_day vì sẽ được gộp vào operating_hours sau
                else if (k === "start_time" || k === "end_time" || k === "all_day") {
                    // Sẽ xử lý riêng sau vòng lặp chính
                }
                // Xử lý transport (backend mong đợi transport_options dạng mảng)
                else if (k === "transport") {
                    // Kiểm tra nếu có giá trị thì bọc vào mảng và JSON.stringify
                    if (v) fd.append('transport_options', JSON.stringify([v])); 
                    else fd.append('transport_options', JSON.stringify([])); // Nếu không có giá trị, gửi mảng rỗng
                }
                // Xử lý is_free (boolean)
                else if (k === "is_free") {
                    fd.append("is_free", v ? "1" : "0");
                }
                // Xử lý note (backend mong đợi caption)
                else if (k === "note") {
                    if (v !== "" && v !== null) fd.append("caption", v);
                }
                // Các trường khác, chỉ thêm nếu có giá trị
                else if (v !== "" && v !== null) {
                    fd.append(k, v);
                }
            });

            // Thêm operating_hours (luôn gửi là một mảng chứa đối tượng hoặc null)
            const operatingHours = {
                all_day: form.all_day,
                open: form.all_day ? null : form.start_time,
                close: form.all_day ? null : form.end_time,
            };
            // Laravel đang mong đợi mảng, nên chúng ta sẽ bọc operatingHours trong một mảng.
            // Dù là all_day hay không, cấu trúc JSON là một mảng chứa một đối tượng.
            fd.append('operating_hours', JSON.stringify([operatingHours]));


            await createCheckinPlace(fd);
            alert("✅ Tạo địa điểm thành công!");
            navigate("/admin/checkin-places");
        } catch (err) {
            console.error("Lỗi tạo địa điểm:", err.response?.data || err.message);
            alert("❌ Có lỗi, kiểm tra console để biết chi tiết: " + (err.response?.data?.message || err.message));
        }
    };

    /* ---------------------------- JSX ----------------------------- */
    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            {/* page heading */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm điểm check‑in mới</h1>
                <p className="text-sm text-gray-500">Thêm những điểm check‑in ấn tượng với người dùng</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                {/* step header */}
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-map-marker-alt" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Bắt đầu điền thông tin điểm check‑in</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm điểm check‑in mới</p>
                    </div>
                </div>

                {/* FORM */}
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
                        <Textarea
                            name="description"
                            label="Mô tả"
                            placeholder="Mô tả chi tiết về địa điểm...."
                            value={form.description}
                            onChange={handleChange}
                        />
                        <Input
                            name="address"
                            label="Địa chỉ"
                            placeholder="Nhập địa chỉ chi tiết"
                            value={form.address}
                            onChange={handleChange}
                        />

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

                        {/* tọa độ */}
                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-building" />
                            <div className="flex gap-2">
                                <input
                                    type="number" // Đã thay đổi type thành number
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange} // Cho phép nhập trực tiếp
                                    placeholder="Vĩ độ"
                                    step="0.000001" // Cho phép nhập số thập phân
                                    className="flex-1 rounded-md border border-gray-300 p-2 text-sm bg-white" // Đổi bg-gray-50 thành bg-white để dễ nhập
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => setShowMap((s) => !s)}
                                >
                                    <i className="fas fa-map-marker-alt" />
                                </button>
                                <input
                                    type="number" // Đã thay đổi type thành number
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange} // Cho phép nhập trực tiếp
                                    placeholder="Kinh độ"
                                    step="0.000001" // Cho phép nhập số thập phân
                                    className="flex-1 rounded-md border border-gray-300 p-2 text-sm bg-white" // Đổi bg-gray-50 thành bg-white để dễ nhập
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => setForm((p) => ({ ...p, latitude: "", longitude: "" }))}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (
                                <i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ.
                                Sau khi chọn trên bản đồ, tọa độ sẽ tự động hiển thị tại đây.
                            </p>
                            {showMap && (
                                <div className="overflow-hidden rounded-md border">
                                    <LocationSelectorMap
                                        latitude={parseFloat(form.latitude) || 21.028511} // Pass current lat or default
                                        longitude={parseFloat(form.longitude) || 105.804817} // Pass current lng or default
                                        onLocationChange={handleLocation} // Correct prop name
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
                            onRemove={() => setForm((p) => ({ ...p, image: null }))}
                            onChange={(e) => handleFile(e, "image")}
                        />
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
                    </Section>

                    {/* 3. Đánh giá & Giá cả */}
                    <Section title="Đánh giá và giá cả" icon="fas fa-star" iconColor="text-yellow-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* trái */}
                            <div className="space-y-6">
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
                                    ]}
                                />

                                {/* giờ */}
                                <div className="space-y-3">
                                    <Label text="Giờ hoạt động" icon="fas fa-clock" iconColor="text-blue-500" />
                                    <div className="flex gap-3">
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={form.start_time}
                                            onChange={handleChange}
                                            className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                                            disabled={form.all_day}
                                            required={!form.all_day} // Required only if not all day
                                        />
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={form.end_time}
                                            onChange={handleChange}
                                            className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                                            disabled={form.all_day}
                                            required={!form.all_day} // Required only if not all day
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="all_day" checked={form.all_day} onChange={handleChange} /> Tất cả thời gian
                                    </label>
                                </div>
                            </div>

                            {/* phải – có border‑l trên màn hình lớn */}
                            <div className="space-y-6 md:border-l md:pl-6">
                                {/* giá */}
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
                                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                            min="0"
                                        />
                                    )}
                                </div>

                                {/* transport - Đã cập nhật để dùng Select với dữ liệu động */}
                                <div className="space-y-2">
                                    <Label text="Phương tiện di chuyển" icon="fas fa-car" iconColor="text-cyan-500" />
                                    <Select
                                        name="transport"
                                        value={form.transport}
                                        onChange={handleChange}
                                        options={[
                                            { value: "", label: "--Chọn phương tiện--" },
                                            // Map transportationTypes để tạo các option
                                            ...transportationTypes.map((type) => ({ value: type.name, label: type.name })),
                                        ]}
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                    />
                                </div>

                                {/* status */}
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
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </Section>

                    {/* actions */}
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
                            onClick={() => setForm(initialForm)}
                            className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Lưu điểm check‑in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ----------------------- UI primitives (Giữ nguyên) ------------------------ */
// Các component này đã được định nghĩa và tôi giữ nguyên chúng để đảm bảo tính nhất quán.
// Vui lòng đảm bảo chúng tồn tại trong môi trường code của bạn hoặc được định nghĩa ở đây.

const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6"> {/* Thêm padding bottom và margin bottom để tách các section */}
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

// Lưu ý: Select component trong bản gốc của bạn không có `key` trong `options.map`.
// Tôi đã điều chỉnh nó ở trên để đảm bảo `key` được thêm vào nếu bạn sử dụng lại nó trong file này.
// Đây là một phiên bản đầy đủ hơn của Select nếu nó được định nghĩa riêng lẻ.
// Nếu bạn đã có Select component ở đâu đó, hãy đảm bảo nó tương thích.
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
                <i className="fas fa-cloud-upload-alt mb-3 text-3xl text-gray-400" />
                <p className="text-gray-600">Kéo thả hình ảnh vào đây</p>
                <label className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                    Chọn file
                    <input type="file" accept="image/*" onChange={onChange} className="hidden" />
                </label>
            </>
        )}
    </div>
);

const Thumb = ({ src, onRemove, onReplace }) => (
    <div className="group relative aspect-video overflow-hidden rounded-md border border-gray-300">
        <img src={src} alt="gallery" className="h-full w-full object-cover" />
        <button
            type="button"
            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            onClick={onRemove}
        >
            <i className="fas fa-times" />
        </button>
        <label className="absolute bottom-1 left-1 cursor-pointer rounded bg-gray-800 bg-opacity-70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Đổi ảnh
            <input type="file" accept="image/*" onChange={onReplace} className="hidden" />
        </label>
    </div>
);
