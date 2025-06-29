import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Đã điều chỉnh đường dẫn import. Vui lòng kiểm tra lại cấu trúc thư mục của bạn
// để đảm bảo file service này nằm trong thư mục 'admin' và có tên là 'index.jsx'
import { createTransportCompany } from "../../../services/ui/TransportCompany/transportCompanyService"; 

const CreateTransportCompany = () => {
    const navigate = useNavigate();

    // Khởi tạo state cho form với các trường và cấu trúc dữ liệu mới/điều chỉnh
    const [form, setForm] = useState({
        name: "",
        transportation_id: "",
        short_description: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        logo_file: null, // Thay thế 'logo' (URL) bằng 'logo_file' (File object)
        logo_url: "", // Để lưu URL logo hiện có nếu có, hoặc hiển thị preview sau khi chọn file
        rating: "",
        phone_number: "",
        email: "",
        website: "",
        base_km: "",
        additional_km: "",
        waiting_minute_fee: "",
        night_fee: "", // Phụ thu ban đêm
        contact_response_time: "",
        has_mobile_app: false,
        payment_cash: false,
        payment_card: false, // "Hỗ trợ thanh toán app ngân hàng"
        payment_momo: false, // Thêm MoMo
        payment_zalo_pay: false, // Thêm Zalo Pay
        status: "active",
        operating_hours: { // Vẫn giữ cấu trúc object để JSON.stringify
            'Thứ 2- Chủ Nhật': '', // Sẽ map với input "Giờ hoạt động"
            'Tổng Đài ': '', // Giá trị mặc định hoặc bỏ qua nếu không có input riêng
            'Thời gian phản hồi': '', // Giá trị mặc định hoặc bỏ qua nếu không có input riêng
        },
        highlight_services: [], // Initialized as an empty array
        selected_city: "", // Thêm trường này để lưu giá trị chọn từ dropdown "Tỉnh/Thành phố"
    });

    const [previewLogo, setPreviewLogo] = useState(null); // State để hiển thị preview logo
    const [submitting, setSubmitting] = useState(false); // State để quản lý trạng thái submit

    // Reset form khi component mount (hoặc khi cần)
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
            status: "active",
            operating_hours: {
                'Thứ 2- Chủ Nhật': '',
                'Tổng Đài ': '',
                'Thời gian phản hồi': '',
            },
            highlight_services: [],
            selected_city: "",
        });
        setPreviewLogo(null);
    }, []);

    // Effect để reset form khi component mount (tương tự như 'Đặt lại' khi tạo mới)
    useEffect(() => {
        resetForm();
    }, [resetForm]);


    // General handler for most input changes
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    // Handler for operating_hours object changes (dành cho input "Giờ hoạt động" tổng thể)
    const handleOperatingHoursChange = useCallback((value) => {
        setForm(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                'Thứ 2- Chủ Nhật': value, // Map input "Giờ hoạt động" vào key này
            },
        }));
    }, []);

    // Handler for highlight_services input (comma-separated string to array)
    const handleHighlightServicesChange = useCallback((e) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            highlight_services: value.split(',').map(s => s.trim()).filter(s => s),
        }));
    }, []);

    // Handler for file input (logo)
    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({ ...prev, logo_file: file }));
            setPreviewLogo(URL.createObjectURL(file));
        } else {
            setForm(prev => ({ ...prev, logo_file: null }));
            setPreviewLogo(null);
        }
    }, []);

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = new FormData();

        // Thêm các trường form vào FormData
        Object.keys(form).forEach(key => {
            if (key === 'logo_file' && form.logo_file) {
                payload.append('logo', form.logo_file); // Backend thường mong đợi tên 'logo'
            } else if (key === 'operating_hours' || key === 'highlight_services') {
                // Chuyển đổi object/array sang JSON string
                payload.append(key, JSON.stringify(form[key]));
            } else if (key.startsWith('payment_')) {
                // Xử lý payment methods riêng ở dưới
                return;
            } else if (key === 'selected_city') { // Bỏ qua trường này, vì nó không được lưu trực tiếp
                return;
            }
            else if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
                payload.append(key, form[key]);
            }
        });

        // Xử lý payment_methods từ các checkbox
        const paymentMethods = [];
        if (form.payment_cash) paymentMethods.push("cash");
        if (form.payment_card) paymentMethods.push("bank_card"); // Hỗ trợ thanh toán app ngân hàng
        if (form.payment_momo) paymentMethods.push("momo"); // MoMo
        if (form.payment_zalo_pay) paymentMethods.push("zalo_pay"); // Zalo Pay
        payload.append('payment_methods', JSON.stringify(paymentMethods));

        // Parse numbers that should be numbers
        payload.set('transportation_id', parseInt(form.transportation_id) || 0);
        payload.set('latitude', parseFloat(form.latitude) || 0);
        payload.set('longitude', parseFloat(form.longitude) || 0);
        payload.set('rating', parseFloat(form.rating) || null);
        
        // Ensure price_range fields are numbers, even if 0
        payload.set('base_km', parseInt(form.base_km) || 0);
        payload.set('additional_km', parseInt(form.additional_km) || 0);
        payload.set('waiting_minute_fee', parseInt(form.waiting_minute_fee) || 0);
        payload.set('night_fee', parseInt(form.night_fee) || 0);


        try {
            await createTransportCompany(payload);
            alert("✅ Tạo hãng vận chuyển thành công!");
            navigate("/admin/transport-companies");
        } catch (error) {
            console.error("❌ Lỗi khi tạo hãng vận chuyển:", error);
            if (error.response && error.response.status === 422) {
                console.error('Lỗi xác thực dữ liệu:', error.response.data.errors);
                alert('❌ Lỗi dữ liệu nhập vào:\n' + JSON.stringify(error.response.data.errors, null, 2));
            } else {
                alert("❌ Lỗi khi tạo hãng vận chuyển. Vui lòng kiểm tra dữ liệu hoặc kết nối mạng.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-inter p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Thêm hãng xe mới</h1>
                    <div className="flex items-center space-x-4">
                        <i className="fas fa-bell text-gray-600 text-lg"></i>
                        <img src="https://i.pravatar.cc/40?img=1" alt="Admin Avatar" className="w-8 h-8 rounded-full" />
                        <span className="text-gray-700 font-medium">Admin</span>
                    </div>
                </header>

                {/* Step Indicator */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center text-blue-600 font-semibold">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">1</div>
                        Bắt đầu điền thông tin hãng xe
                    </div>
                    <p className="text-sm text-gray-500 ml-10">Điền các thông tin cần thiết về danh sách hãng xe</p>
                </div>

                {/* Main Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                            <i className="fas fa-info-circle mr-2 text-blue-500"></i> Thông tin cơ bản
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên hãng xe */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên hãng xe *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Nhập tên hãng xe..."
                                    value={form.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Logo hãng xe */}
                            <div>
                                <label htmlFor="logo_file" className="block text-sm font-medium text-gray-700">Logo hãng xe (tuỳ chọn)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                        {previewLogo ? (
                                            <img
                                                src={previewLogo}
                                                alt="logo-preview"
                                                className="mx-auto h-16 w-16 object-contain"
                                            />
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H10c-1.1 0-2 .9-2 2v28c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V20M28 8V2h8L28 8zm0 0h8v6l-8-6zm-4 4h4v4h-4zM24 16h-4v-4h4zM16 16h-4v-4h4zM24 24h-4v-4h4zM16 24h-4v-4h4zM24 32h-4v-4h4zM16 32h-4v-4h4zM24 40h-4v-4h4zM16 40h-4v-4h4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="logo_file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Kéo thả thêm logo hãng xe</span>
                                                <input
                                                    id="logo_file"
                                                    name="logo_file"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            <p className="pl-1">hoặc chọn file</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF dưới 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả ngắn */}
                            <div>
                                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
                                <textarea
                                    id="short_description"
                                    name="short_description"
                                    placeholder="Nhập mô tả ngắn..."
                                    value={form.short_description}
                                    onChange={handleChange}
                                    rows={2}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Mô tả chi tiết */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Viết mô tả chi tiết về hãng xe..."
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Vị trí địa lý */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                            <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i> Toạ độ địa lý
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Vĩ độ (Latitude) */}
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Vĩ độ</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        id="latitude"
                                        name="latitude"
                                        placeholder="21.0286"
                                        value={form.latitude}
                                        onChange={handleChange}
                                        step="0.000001"
                                        className="flex-1 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        <i className="fas fa-map-pin"></i>
                                    </span>
                                </div>
                            </div>
                            {/* Kinh độ (Longitude) */}
                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Kinh độ</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        id="longitude"
                                        name="longitude"
                                        placeholder="105.0345"
                                        value={form.longitude}
                                        onChange={handleChange}
                                        step="0.000001"
                                        className="flex-1 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        <i className="fas fa-map-pin"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ chi tiết */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ chi tiết *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder="Nhập địa chỉ chi tiết (VD: 123 Đường ABC, Quận 1, TP. Hồ Chí Minh)..."
                                value={form.address}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Số điện thoại */}
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    placeholder="09xx xxx xxx"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {/* Tỉnh/Thành phố (select) - Lấy từ bảng 'locations' */}
                            <div>
                                <label htmlFor="selected_city" className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                                <select
                                    id="selected_city"
                                    name="selected_city"
                                    value={form.selected_city}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">--Chọn Tỉnh/Thành phố--</option>
                                    {/* Các lựa chọn này sẽ được lấy từ bảng 'locations' */}
                                    <option value="Hồ Chí Minh">TP Hồ Chí Minh</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    {/* Thêm các tỉnh/thành phố khác từ bảng locations */}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Lưu ý: Thông tin này dùng để lọc trên giao diện. Vui lòng nhập đầy đủ tỉnh/thành phố vào trường "Địa chỉ chi tiết".
                                </p>
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                placeholder="https://www.example.com"
                                value={form.website}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Thông tin thêm */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                            <i className="fas fa-clipboard-list mr-2 text-blue-500"></i> Thông tin thêm
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Giờ hoạt động */}
                            <div>
                                <label htmlFor="operating_hours_display" className="block text-sm font-medium text-gray-700">Giờ hoạt động</label>
                                <input
                                    type="text"
                                    id="operating_hours_display"
                                    name="operating_hours_display" // Tên riêng cho input display
                                    placeholder="VD: 24/7 hoặc 8:00 - 22:00"
                                    value={form.operating_hours['Thứ 2- Chủ Nhật']} // Map vào key trong object
                                    onChange={(e) => handleOperatingHoursChange(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Hạng đánh giá */}
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Hạng đánh giá</label>
                                <input
                                    type="number"
                                    id="rating"
                                    name="rating"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="0"
                                    value={form.rating}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* ID Loại hình vận chuyển */}
                            <div>
                                <label htmlFor="transportation_id" className="block text-sm font-medium text-gray-700">ID Loại hình vận chuyển</label>
                                <input
                                    type="number"
                                    id="transportation_id"
                                    name="transportation_id"
                                    placeholder="Ví dụ: 1 (xe máy), 2 (ô tô)"
                                    value={form.transportation_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Thời gian phản hồi liên hệ */}
                            <div>
                                <label htmlFor="contact_response_time" className="block text-sm font-medium text-gray-700">Thời gian phản hồi liên hệ</label>
                                <input
                                    type="text"
                                    id="contact_response_time"
                                    name="contact_response_time"
                                    placeholder="VD: 5 phút - 8 phút"
                                    value={form.contact_response_time}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Giá cước */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                            <i className="fas fa-dollar-sign mr-2 text-blue-500"></i> Giá cước
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="base_km" className="block text-sm font-medium text-gray-700">Phí cơ bản (VND) (2km đầu)</label>
                                <input
                                    type="number"
                                    id="base_km"
                                    name="base_km"
                                    placeholder="1000"
                                    value={form.base_km}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="additional_km" className="block text-sm font-medium text-gray-700">Phụ KM (VND) (mỗi km tiếp theo)</label>
                                <input
                                    type="number"
                                    id="additional_km"
                                    name="additional_km"
                                    placeholder="5000"
                                    value={form.additional_km}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="waiting_minute_fee" className="block text-sm font-medium text-gray-700">Phí chờ mỗi phút (VND)</label>
                                <input
                                    type="number"
                                    id="waiting_minute_fee"
                                    name="waiting_minute_fee"
                                    placeholder="5000"
                                    value={form.waiting_minute_fee}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="night_fee" className="block text-sm font-medium text-gray-700">Phụ thu ban đêm (VND)</label>
                                <input
                                    type="number"
                                    id="night_fee"
                                    name="night_fee"
                                    placeholder="5000"
                                    value={form.night_fee}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tính năng và Phương thức thanh toán */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <fieldset className="p-4 border border-gray-200 rounded-md shadow-sm">
                            <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2 -mt-4 bg-white">
                                <i className="fas fa-cogs mr-2 text-blue-500"></i> Tính năng
                            </legend>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-gray-700">
                                    <input type="checkbox" name="has_mobile_app" checked={form.has_mobile_app} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Hãng xe có ứng dụng di động riêng</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    {/* Giả định 'Có bảo hiểm chuyến đi' là một trong các highlight_services */}
                                    <input type="checkbox" name="has_insurance" checked={form.highlight_services.includes('Có bảo hiểm chuyến đi')} onChange={() => handleHighlightServicesChange({ target: { value: form.highlight_services.includes('Có bảo hiểm chuyến đi') ? form.highlight_services.filter(s => s !== 'Có bảo hiểm chuyến đi').join(', ') : [...form.highlight_services, 'Có bảo hiểm chuyến đi'].join(', ') }})} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Có bảo hiểm chuyến đi</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    {/* Giả định 'Hiển thị trên ứng dụng, website' là một trong các highlight_services */}
                                    <input type="checkbox" name="has_website_visibility" checked={form.highlight_services.includes('Hiển thị trên ứng dụng, website')} onChange={() => handleHighlightServicesChange({ target: { value: form.highlight_services.includes('Hiển thị trên ứng dụng, website') ? form.highlight_services.filter(s => s !== 'Hiển thị trên ứng dụng, website').join(', ') : [...form.highlight_services, 'Hiển thị trên ứng dụng, website'].join(', ') }})} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Hiển thị trên ứng dụng, website</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    {/* Giả định 'Theo dõi GPS' là một trong các highlight_services */}
                                    <input type="checkbox" name="has_gps_tracking" checked={form.highlight_services.includes('Theo dõi GPS')} onChange={() => handleHighlightServicesChange({ target: { value: form.highlight_services.includes('Theo dõi GPS') ? form.highlight_services.filter(s => s !== 'Theo dõi GPS').join(', ') : [...form.highlight_services, 'Theo dõi GPS'].join(', ') }})} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Theo dõi GPS</span>
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className="p-4 border border-gray-200 rounded-md shadow-sm">
                            <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2 -mt-4 bg-white">
                                <i className="fas fa-wallet mr-2 text-blue-500"></i> Phương thức thanh toán
                            </legend>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-gray-700">
                                    <input type="checkbox" name="payment_cash" checked={form.payment_cash} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Tiền mặt</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    <input type="checkbox" name="payment_card" checked={form.payment_card} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Thẻ ngân hàng</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    <input type="checkbox" name="payment_momo" checked={form.payment_momo} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>MoMo</span>
                                </label>
                                <label className="flex items-center space-x-2 text-gray-700">
                                    <input type="checkbox" name="payment_zalo_pay" checked={form.payment_zalo_pay} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                                    <span>Zalo Pay</span>
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    {/* Các dịch vụ nổi bật */}
                    <div className="pt-4">
                        <label htmlFor="highlight_services_input" className="block text-sm font-medium text-gray-700">Các dịch vụ nổi bật (phân cách bởi dấu phẩy)</label>
                        <input
                            type="text"
                            id="highlight_services_input"
                            name="highlight_services_input" // Tên riêng cho input display
                            placeholder="VD: Dịch vụ nhanh, Hỗ trợ 24/7, Xe 7 chỗ"
                            value={form.highlight_services.join(', ')} // Hiển thị mảng dưới dạng chuỗi
                            onChange={handleHighlightServicesChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Trạng thái hoạt động */}
                    <div className="pt-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">📌 Trạng thái hoạt động:</label>
                        <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ngừng hoạt động</option>
                            <option value="draft">Nháp</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/transport-companies')}
                            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md shadow-md hover:bg-gray-600 transition-colors duration-200"
                        >
                            <i className="fas fa-arrow-left mr-2"></i> Hủy
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
