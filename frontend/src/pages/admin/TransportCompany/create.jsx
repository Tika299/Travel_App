import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTransportCompany } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService";
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx'; // Đảm bảo đường dẫn này đúng

// --- Các Component UI cơ bản ---
// Nếu các component này chưa tồn tại trong project của bạn, bạn cần tạo chúng
// hoặc điều chỉnh import paths để phù hợp với cấu trúc thư mục của bạn.
// Hoặc bạn có thể định nghĩa chúng trực tiếp trong file này (như tôi đã làm ở đây cho tiện demo).

const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            {icon && <i className={`${icon} ${iconColor}`} />} {title}
        </h2>
        {children}
    </section>
);

const Label = ({ text, icon, iconColor = "text-blue-500", className = "" }) => (
    <p className={`flex items-center text-sm font-medium text-gray-700 ${className}`}>
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

const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3, className = "" }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
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

// --- Component CreateTransportCompany chính ---
const CreateTransportCompany = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        transportation_id: "",
        short_description: "",
        description: "",
        address: "",
        latitude: "", // Khởi tạo rỗng để người dùng nhập hoặc chọn từ bản đồ
        longitude: "", // Khởi tạo rỗng để người dùng nhập hoặc chọn từ bản đồ
        logo_file: null,
        logo_url: "", // Để lưu URL logo hiện có nếu có (trong trường hợp sửa), hoặc hiển thị preview
        rating: "",
        phone_number: "",
        email: "",
        website: "",
        base_km: "",
        additional_km: "",
        waiting_minute_fee: "",
        night_fee: "",
        contact_response_time: "",
        has_mobile_app: false,
        payment_cash: false,
        payment_card: false,
        payment_momo: false,
        payment_zalo_pay: false,
        operating_hours: { "Thứ 2 - Chủ Nhật": "" },
        highlight_services: [],
        status: "active",
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [showMap, setShowMap] = useState(false); // State để bật/tắt hiển thị bản đồ

    useEffect(() => {
        const fetchTransportations = async () => {
            try {
                const response = await getAllTransportations();
                if (response && response.data && Array.isArray(response.data.data)) {
                    setTransportationTypes(response.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", response);
                    setTransportationTypes([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách phương tiện:", error);
                alert("Không thể tải danh sách phương tiện. Vui lòng thử lại.");
            }
        };
        fetchTransportations();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;

        if (type === "checkbox") {
            finalValue = checked;
        } else if (type === "number") {
            // Cho phép rỗng nếu người dùng xóa hết số, hoặc chuyển đổi sang float
            finalValue = value === "" ? "" : parseFloat(value);
            // Kiểm tra nếu giá trị sau khi parse là NaN (không phải số), có thể đặt về rỗng
            if (isNaN(finalValue) && value !== "") {
                finalValue = ""; // Hoặc giữ nguyên giá trị chuỗi không hợp lệ nếu muốn hiển thị lỗi
            }
        }

        setForm((p) => ({ ...p, [name]: finalValue }));
        setErrors((p) => ({ ...p, [name]: undefined })); // Xóa lỗi khi người dùng bắt đầu nhập
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, logo_file: file }));
            setPreviewLogo(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, logo: undefined }));
        } else {
            // Nếu không có file được chọn hoặc bị hủy, đặt lại
            setForm(prev => ({ ...prev, logo_file: null }));
            setPreviewLogo(null);
            // Có thể giữ lỗi hoặc thêm lỗi mới tùy logic
            setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
        }
    }, []);

    const handleRemoveLogo = useCallback(() => {
        setForm(prev => ({ ...prev, logo_file: null, logo_url: "" })); // Xóa cả file và URL cũ
        setPreviewLogo(null);
        setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
    }, []);

    const handleOperatingHoursChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((p) => ({
            ...p,
            operating_hours: { ...p.operating_hours, [name]: value },
        }));
    }, []);

    const handleHighlightServicesChange = useCallback((e) => {
        const value = e.target.value;
        // Chuyển chuỗi comma-separated thành mảng các service
        const servicesArray = value.split(',').map(s => s.trim()).filter(s => s);
        setForm(p => ({ ...p, highlight_services: servicesArray }));
    }, []);

    // Hàm callback từ LocationSelectorMap để cập nhật latitude/longitude
    const handleLocationSelect = useCallback((lat, lng) => {
        // Đảm bảo rằng lat và lng là số trước khi làm tròn và cập nhật state
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";

        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined })); // Xóa lỗi tọa độ
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Tên hãng xe không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (!form.transportation_id) {
            newErrors.transportation_id = "Vui lòng chọn loại phương tiện.";
        }
        // Validation cho latitude và longitude
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
        } else if (lat < -90 || lat > 90) {
            newErrors.latitude = "Vĩ độ phải nằm trong khoảng -90 đến 90.";
        } else if (lng < -180 || lng > 180) {
            newErrors.longitude = "Kinh độ phải nằm trong khoảng -180 đến 180.";
        }

        // Kiểm tra logo: phải có file mới hoặc đã có URL logo cũ (khi sửa)
        // Trong trường hợp tạo mới, chỉ cần logo_file
        if (!form.logo_file && !form.logo_url) { // logo_url chỉ có khi EDIT, không có khi CREATE
            newErrors.logo = "Vui lòng tải lên ảnh logo.";
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

        setSubmitting(true);
        setErrors({}); // Xóa tất cả lỗi trước khi gửi

        const payload = new FormData();

        // Lặp qua các trường trong form state
        Object.keys(form).forEach(key => {
            if (key === 'logo_file') {
                if (form.logo_file) {
                    payload.append('logo', form.logo_file); // Gửi file ảnh dưới tên 'logo'
                }
            } else if (key === 'operating_hours' || key === 'highlight_services') {
                // Các trường này là mảng/đối tượng, cần JSON.stringify
                payload.append(key, JSON.stringify(form[key]));
            } else if (key === 'has_mobile_app') {
                // Chuyển boolean thành '1' hoặc '0'
                payload.append(key, form[key] ? '1' : '0');
            } else if (key.startsWith('payment_')) {
                // Xử lý payment_methods riêng sau vòng lặp này
            } else if (key === 'logo_url') {
                // Bỏ qua logo_url, vì chúng ta gửi logo_file hoặc không gửi gì
            }
             else if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
                // Các trường khác, đảm bảo không rỗng và không undefined/null
                payload.append(key, form[key]);
            }
        });

        // Xử lý payment_methods từ các checkbox
        const paymentMethods = [];
        if (form.payment_cash) paymentMethods.push("cash");
        if (form.payment_card) paymentMethods.push("bank_card");
        if (form.payment_momo) paymentMethods.push("momo");
        if (form.payment_zalo_pay) paymentMethods.push("zalo_pay");
        payload.append('payment_methods', JSON.stringify(paymentMethods));

        // Đảm bảo các trường số được thêm vào payload và là số
        // Lấy giá trị đã được parse từ form.latitude/longitude
        payload.set('latitude', parseFloat(form.latitude));
        payload.set('longitude', parseFloat(form.longitude));
        payload.set('transportation_id', parseInt(form.transportation_id));
        payload.set('rating', parseFloat(form.rating) || null); // Gửi null nếu rỗng
        payload.set('base_km', parseFloat(form.base_km) || 0);
        payload.set('additional_km', parseFloat(form.additional_km) || 0);
        payload.set('waiting_minute_fee', parseFloat(form.waiting_minute_fee) || 0);
        payload.set('night_fee', parseFloat(form.night_fee) || 0);


        try {
            await createTransportCompany(payload);
            alert("✅ Tạo hãng vận chuyển thành công!");
            navigate("/admin/transport-companies");
        } catch (error) {
            console.error("❌ Lỗi khi tạo hãng vận chuyển:", error);
            if (error.response && error.response.status === 422) {
                console.error('Lỗi xác thực dữ liệu:', error.response.data.errors);
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0]; // Lấy thông báo lỗi đầu tiên
                    }
                }
                setErrors(formattedErrors);
                alert('❌ Lỗi dữ liệu nhập vào:\n' + JSON.stringify(formattedErrors, null, 2));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("❌ Lỗi khi tạo hãng vận chuyển. Vui lòng kiểm tra dữ liệu hoặc kết nối mạng.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setForm({
            name: "",
            transportation_id: "",
            short_description: "",
            description: "",
            address: "",
            latitude: "",
            longitude: "",
            logo_file: null,
            logo_url: "",
            rating: "",
            phone_number: "",
            email: "",
            website: "",
            base_km: "",
            additional_km: "",
            waiting_minute_fee: "",
            night_fee: "",
            contact_response_time: "",
            has_mobile_app: false,
            payment_cash: false,
            payment_card: false,
            payment_momo: false,
            payment_zalo_pay: false,
            operating_hours: { "Thứ 2 - Chủ Nhật": "" },
            highlight_services: [],
            status: "active",
        });
        setPreviewLogo(null);
        setErrors({});
        alert("Đã đặt lại form.");
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm hãng vận chuyển mới</h1>
                <p className="text-sm text-gray-500">Điền đầy đủ thông tin để thêm hãng vận chuyển mới</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-building" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Thông tin hãng vận chuyển</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm hãng vận chuyển mới</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    {/* 1. Thông tin cơ bản */}
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input
                            name="name"
                            label={<>Tên hãng xe <span className="text-red-500">*</span></>}
                            placeholder="Nhập tên hãng xe...."
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

                        <Select
                            name="transportation_id"
                            label={<>Loại phương tiện <span className="text-red-500">*</span></>}
                            value={form.transportation_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "", label: "--Chọn loại phương tiện--" },
                                ...transportationTypes.map((type) => ({ value: type.id, label: type.name })),
                            ]}
                        />
                        {errors.transportation_id && <p className="text-red-500 text-xs mt-1">{errors.transportation_id}</p>}

                        <Textarea
                            name="short_description"
                            label="Mô tả ngắn"
                            placeholder="Mô tả ngắn gọn về hãng xe...."
                            value={form.short_description}
                            onChange={handleChange}
                        />
                        <Textarea
                            name="description"
                            label="Mô tả chi tiết"
                            placeholder="Mô tả chi tiết về hãng xe...."
                            value={form.description}
                            onChange={handleChange}
                        />

                        <Input
                            name="address"
                            label={<>Địa chỉ <span className="text-red-500">*</span></>}
                            placeholder="Nhập địa chỉ chi tiết"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

                        {/* Tọa độ địa lý - Đã tích hợp từ CreateCheckinPlace.jsx */}
                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-map-marker-alt" />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude} // Giữ nguyên giá trị chuỗi từ state để dễ dàng kiểm soát input rỗng
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
                                    value={form.longitude} // Giữ nguyên giá trị chuỗi từ state để dễ dàng kiểm soát input rỗng
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
                                        alert("Đã đặt lại tọa độ về rỗng.");
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (<i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ. Sau khi chọn trên bản đồ, tọa độ sẽ tự động hiển thị tại đây.
                            </p>
                            {showMap && (
                                <div className="overflow-hidden rounded-md border">
                                    <LocationSelectorMap
                                        initialLatitude={parseFloat(form.latitude) || 21.028511} // Mặc định Hà Nội nếu chưa có
                                        initialLongitude={parseFloat(form.longitude) || 105.804817} // Mặc định Hà Nội nếu chưa có
                                        onLocationSelect={handleLocationSelect} // <-- Hàm callback để nhận tọa độ từ bản đồ
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* 2. Logo */}
                    <Section title="Logo" icon="fas fa-image">
                        <Label text="Ảnh Logo" />
                        <DropZone
                            file={form.logo_file} // Chỉ truyền logo_file, vì previewLogo sẽ được tạo từ nó
                            onChange={handleFileChange}
                            onRemove={handleRemoveLogo}
                        />
                        {previewLogo && (
                            <div className="mt-2 text-center text-sm text-gray-500">
                                <img src={previewLogo} alt="Logo Preview" className="max-w-xs mx-auto rounded-md shadow" />
                            </div>
                        )}
                        {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                    </Section>

                    {/* 3. Chi tiết hoạt động và thanh toán */}
                    <Section title="Chi tiết hoạt động" icon="fas fa-clock">
                        <Input
                            name="contact_response_time"
                            label="Thời gian phản hồi liên hệ"
                            placeholder="Ví dụ: Trong vòng 30 phút"
                            value={form.contact_response_time}
                            onChange={handleChange}
                        />
                        <Input
                            name="phone_number"
                            label="Số điện thoại"
                            placeholder="Nhập số điện thoại liên hệ"
                            value={form.phone_number}
                            onChange={handleChange}
                        />
                        <Input
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="Nhập email liên hệ"
                            value={form.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="website"
                            label="Website"
                            type="url"
                            placeholder="Nhập địa chỉ website (nếu có)"
                            value={form.website}
                            onChange={handleChange}
                        />

                        <div className="space-y-2">
                            <Label text="Giờ hoạt động" icon="fas fa-business-time" />
                            <input
                                type="text"
                                name="Thứ 2 - Chủ Nhật"
                                value={form.operating_hours["Thứ 2 - Chủ Nhật"] || ""}
                                onChange={handleOperatingHoursChange}
                                placeholder="Ví dụ: 8:00 - 22:00 hàng ngày"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label text="Dịch vụ nổi bật (phân cách bởi dấu phẩy)" icon="fas fa-star" />
                            <Textarea
                                name="highlight_services"
                                placeholder="Ví dụ: Đưa đón tận nơi, Xe đời mới, Tài xế nhiệt tình"
                                value={form.highlight_services.join(', ')} // Hiển thị mảng thành chuỗi
                                onChange={handleHighlightServicesChange}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label text="Phương thức thanh toán" icon="fas fa-money-bill-wave" />
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="payment_cash"
                                        checked={form.payment_cash}
                                        onChange={handleChange}
                                    /> Tiền mặt
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="payment_card"
                                        checked={form.payment_card}
                                        onChange={handleChange}
                                    /> Chuyển khoản ngân hàng
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="payment_momo"
                                        checked={form.payment_momo}
                                        onChange={handleChange}
                                    /> Momo
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="payment_zalo_pay"
                                        checked={form.payment_zalo_pay}
                                        onChange={handleChange}
                                    /> ZaloPay
                                </label>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="has_mobile_app"
                                checked={form.has_mobile_app}
                                onChange={handleChange}
                            /> Có ứng dụng di động
                        </label>
                    </Section>

                    {/* 4. Giá cước và Rating */}
                    <Section title="Giá cước và Đánh giá" icon="fas fa-dollar-sign" iconColor="text-green-500">
                        <Input
                            name="base_km"
                            label="Giá cước km cơ bản (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước km đầu tiên"
                            value={form.base_km}
                            onChange={handleChange}
                            min="0"
                        />
                        <Input
                            name="additional_km"
                            label="Giá cước km bổ sung (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước cho các km tiếp theo"
                            value={form.additional_km}
                            onChange={handleChange}
                            min="0"
                        />
                        <Input
                            name="waiting_minute_fee"
                            label="Phí chờ (VND/phút)"
                            type="number"
                            placeholder="Nhập phí chờ mỗi phút"
                            value={form.waiting_minute_fee}
                            onChange={handleChange}
                            min="0"
                        />
                         <Input
                            name="night_fee"
                            label="Phụ thu ban đêm (VND/chuyến)"
                            type="number"
                            placeholder="Nhập phụ thu ban đêm"
                            value={form.night_fee}
                            onChange={handleChange}
                            min="0"
                        />
                        <Select
                            name="rating"
                            label="Đánh giá trung bình (0-5)"
                            value={form.rating}
                            onChange={handleChange}
                            options={[
                                { value: "", label: "--Chọn đánh giá--" },
                                { value: "5", label: "★★★★★" },
                                { value: "4", label: "★★★★☆" },
                                { value: "3", label: "★★★☆☆" },
                                { value: "2", label: "★★☆☆☆" },
                                { value: "1", label: "★☆☆☆☆" },
                                { value: "0", label: "☆☆☆☆☆" },
                            ]}
                        />
                        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}

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
                    </Section>

                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors duration-200"
                        >
                            <i className="fas fa-times mr-2"></i> Huỷ
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
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
                                    <i className="fas fa-save mr-2"></i> Lưu hãng xe
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTransportCompany;