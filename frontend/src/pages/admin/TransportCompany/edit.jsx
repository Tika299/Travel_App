import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTransportCompanyById } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService";
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx';
import axios from "axios"; // Thêm import axios

// --- Basic UI Components for reusability ---
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

const DropZone = ({ file, onChange, onRemove, existingUrl }) => (
    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
        {file || existingUrl ? (
            <div className="group relative h-40 w-full">
                <img src={file ? URL.createObjectURL(file) : existingUrl} alt="preview" className="h-full w-full object-cover" />
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

// --- Main EditTransportCompany component ---
const EditTransportCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        transportation_id: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        logo_file: null,
        phone_number: "",
        email: "",
        website: "",
        price_range: {
            base_km: "",
            additional_km: "",
            waiting_minute_fee: "",
            night_fee: ""
        },
        has_mobile_app: false,
        payment_methods: [],
        operating_hours: { "Thứ 2 - Chủ Nhật": "" },
        status: "active",
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [showMap, setShowMap] = useState(false);

    // Fetch transportation types and existing company data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const transportationResponse = await getAllTransportations();
                if (transportationResponse && transportationResponse.data && Array.isArray(transportationResponse.data.data)) {
                    setTransportationTypes(transportationResponse.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", transportationResponse);
                }

                if (id) {
                    const companyResponse = await getTransportCompanyById(id);
                    const companyData = companyResponse.data.data;
                    console.log("Dữ liệu hãng xe được tải về:", companyData);
                    if (companyData) {
                        setForm({
                            name: companyData.name || "",
                            transportation_id: companyData.transportation_id || "",
                            description: companyData.description || "",
                            address: companyData.address || "",
                            latitude: companyData.latitude || "",
                            longitude: companyData.longitude || "",
                            logo_file: null,
                            phone_number: companyData.phone_number || "",
                            email: companyData.email || "",
                            website: companyData.website || "",
                            price_range: companyData.price_range || { base_km: "", additional_km: "", waiting_minute_fee: "", night_fee: "" },
                            has_mobile_app: companyData.has_mobile_app || false,
                            payment_methods: companyData.payment_methods || [],
                            operating_hours: companyData.operating_hours || { "Thứ 2 - Chủ Nhật": "" },
                            status: companyData.status || "active",
                        });
                        setExistingLogoUrl(companyData.logo || null);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                alert("Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại.");
                navigate("/admin/transport-companies");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);


    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;
        if (type === "checkbox") {
            finalValue = checked;
        } else if (type === "number") {
            finalValue = value === "" ? "" : parseFloat(value);
            if (isNaN(finalValue) && value !== "") {
                finalValue = "";
            }
        }
        setForm((p) => ({ ...p, [name]: finalValue }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    }, []);

    const handlePriceRangeChange = useCallback((e) => {
        const { name, value } = e.target;
        let finalValue = value === "" ? "" : parseFloat(value);
        if (isNaN(finalValue) && value !== "") {
            finalValue = "";
        }
        setForm(p => ({
            ...p,
            price_range: {
                ...p.price_range,
                [name]: finalValue
            }
        }));
        setErrors(p => ({ ...p, [name]: undefined }));
    }, []);

    const handlePaymentMethodsChange = useCallback((e) => {
        const { value, checked } = e.target;
        setForm(p => {
            const currentMethods = [...p.payment_methods];
            if (checked) {
                if (!currentMethods.includes(value)) {
                    currentMethods.push(value);
                }
            } else {
                const index = currentMethods.indexOf(value);
                if (index > -1) {
                    currentMethods.splice(index, 1);
                }
            }
            return { ...p, payment_methods: currentMethods };
        });
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, logo_file: file }));
            setPreviewLogo(URL.createObjectURL(file));
            setExistingLogoUrl(null);
            setErrors(prev => ({ ...prev, logo: undefined }));
        } else {
            setForm(prev => ({ ...prev, logo_file: null }));
            setPreviewLogo(null);
            setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
        }
    }, []);

    const handleRemoveLogo = useCallback(() => {
        setForm(prev => ({ ...prev, logo_file: null }));
        setPreviewLogo(null);
        setExistingLogoUrl(null);
        setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
    }, []);

    const handleOperatingHoursChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((p) => ({
            ...p,
            operating_hours: { ...p.operating_hours, [name]: value },
        }));
    }, []);

    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";
        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
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
        if (!form.logo_file && !existingLogoUrl) {
            newErrors.logo = "Vui lòng tải lên ảnh logo.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.error("Lỗi xác thực form phía client.");
            alert("Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);
        setErrors({});

        const payload = new FormData();
        // IMPORTANT: Use POST for FormData with method override, as PUT doesn't work well with FormData in some setups.
        payload.append('_method', 'PUT'); 
        payload.append('name', form.name);
        payload.append('transportation_id', form.transportation_id);
        payload.append('description', form.description);
        payload.append('address', form.address);
        payload.append('latitude', form.latitude);
        payload.append('longitude', form.longitude);
        payload.append('phone_number', form.phone_number);
        payload.append('email', form.email);
        payload.append('website', form.website);
        payload.append('status', form.status);
        payload.append('has_mobile_app', form.has_mobile_app ? '1' : '0');

        if (form.logo_file) {
            payload.append('logo', form.logo_file);
        } else if (existingLogoUrl === null) {
            // Trường hợp người dùng xóa logo hiện có
            payload.append('logo', '');
        }

        // Encode JSON fields as strings
        payload.append('operating_hours', JSON.stringify(form.operating_hours));
        const priceRangePayload = {
            base_km: parseFloat(form.price_range.base_km) || 0,
            additional_km: parseFloat(form.price_range.additional_km) || 0,
            waiting_minute_fee: parseFloat(form.price_range.waiting_minute_fee) || 0,
            night_fee: parseFloat(form.price_range.night_fee) || 0,
        };
        payload.append('price_range', JSON.stringify(priceRangePayload));
        payload.append('payment_methods', JSON.stringify(form.payment_methods));

        // LOG: In nội dung của FormData ra console
        console.log("Đang chuẩn bị gửi payload FormData:");
        for (let [key, value] of payload.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            // Thay đổi: Thực hiện cuộc gọi axios trực tiếp để xác định lỗi
            // Nếu bạn muốn sử dụng lại service, hãy đảm bảo hàm updateTransportCompany
            // được định nghĩa để nhận FormData.
            const response = await axios.post(`http://localhost:8000/api/transport-companies/${id}`, payload, {
                 headers: {
                    // Axios sẽ tự động đặt 'Content-Type' thành 'multipart/form-data' khi gửi FormData.
                    // Chúng ta không cần phải chỉ định thủ công.
                    // Tuy nhiên, nếu muốn ghi đè, hãy dùng 'multipart/form-data'
                    // 'Content-Type': 'multipart/form-data'
                }
            });

            console.log("API response:", response); // Log phản hồi từ API
            alert("✅ Cập nhật hãng vận chuyển thành công!");
            navigate("/admin/transport-companies");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật hãng vận chuyển:", error);
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                alert('❌ Lỗi dữ liệu nhập vào. Vui lòng kiểm tra console để biết chi tiết:\n' + JSON.stringify(formattedErrors, null, 2));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("❌ Lỗi khi cập nhật hãng vận chuyển. Vui lòng kiểm tra dữ liệu hoặc kết nối mạng.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa hãng vận chuyển</h1>
                <p className="text-sm text-gray-500">Cập nhật thông tin chi tiết cho hãng vận chuyển</p>
            </div>
            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-edit" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Thông tin hãng vận chuyển</p>
                        <p className="text-xs text-gray-500">Chỉnh sửa và cập nhật các thông tin cần thiết</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    {/* 1. Basic Info */}
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
                        {/* Geo-coordinates */}
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
                                        alert("Đã đặt lại tọa độ về rỗng.");
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (<i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ.
                                Sau khi chọn trên bản đồ, tọa độ sẽ tự động hiển thị tại đây.
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
                    {/* 2. Logo */}
                   <Section title="Logo" icon="fas fa-image">
  <Label text="Ảnh Logo" />
  <DropZone
    file={form.logo_file}
    onChange={handleFileChange}
    onRemove={handleRemoveLogo}
    existingUrl={existingLogoUrl}
  />

  {/* Hiển thị ảnh xem trước hoặc logo từ server */}
  {(previewLogo || company?.logo) && (
    <div className="mt-2 text-center text-sm text-gray-500">
      <img
        src={
          previewLogo
            ? previewLogo
            : company.logo
            ? `http://localhost:8000${company.logo.startsWith('/') ? '' : '/'}${company.logo}`
            : 'https://placehold.co/40x40/E0F2F7/000000?text=Logo'
        }
        alt="Logo Preview"
        className="max-w-xs mx-auto rounded-md shadow"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/40x40/E0F2F7/000000?text=Logo';
        }}
      />
    </div>
  )}

  {errors.logo && (
    <p className="text-red-500 text-xs mt-1">{errors.logo}</p>
  )}
</Section>

                    {/* 3. Operation and Payment Details */}
                    <Section title="Chi tiết hoạt động" icon="fas fa-clock">
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
                            <Label text="Phương thức thanh toán" icon="fas fa-money-bill-wave" />
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="cash"
                                        checked={form.payment_methods.includes("cash")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Tiền mặt
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="bank_card"
                                        checked={form.payment_methods.includes("bank_card")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Chuyển khoản ngân hàng
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="momo"
                                        checked={form.payment_methods.includes("momo")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Momo
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="zalo_pay"
                                        checked={form.payment_methods.includes("zalo_pay")}
                                        onChange={handlePaymentMethodsChange}
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
                    {/* 4. Pricing and Status */}
                    <Section title="Giá cước" icon="fas fa-dollar-sign" iconColor="text-green-500">
                        <Input
                            name="base_km"
                            label="Giá cước km cơ bản (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước km đầu tiên"
                            value={form.price_range.base_km}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Input
                            name="additional_km"
                            label="Giá cước km bổ sung (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước cho các km tiếp theo"
                            value={form.price_range.additional_km}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Input
                            name="waiting_minute_fee"
                            label="Phí chờ (VND/phút)"
                            type="number"
                            placeholder="Nhập phí chờ mỗi phút"
                            value={form.price_range.waiting_minute_fee}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                         <Input
                            name="night_fee"
                            label="Phụ thu ban đêm (VND/chuyến)"
                            type="number"
                            placeholder="Nhập phụ thu ban đêm"
                            value={form.price_range.night_fee}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
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
                    {/* Action buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors duration-200"
                        >
                            <i className="fas fa-times mr-2"></i> Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Đang cập nhật...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <i className="fas fa-save mr-2"></i> Cập nhật hãng xe
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditTransportCompany;
