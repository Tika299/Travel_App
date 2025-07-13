import React, { useState, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { createTransportation } from '../../../services/ui/Transportation/transportationService'; // Đảm bảo đường dẫn này đúng

// Tags và Features sẽ được hiển thị với nhãn tiếng Việt
const tags = [
    { value: 'uy_tin', label: 'Uy tín' },
    { value: 'pho_bien', label: 'Phổ biến' },
    { value: 'cong_nghe', label: 'Công nghệ' },
    // Thêm các tags khác nếu có
];

const features = [
    { value: 'has_app', label: 'Có ứng dụng đặt xe' },
    { value: 'card_payment', label: 'Hỗ trợ thanh toán app/ngân hàng' },
    { value: 'insurance', label: 'Có bảo hiểm chuyến đi' },
    { value: 'is_visible', label: 'Hiển thị trên ứng dụng, website' }, // Đã di chuyển is_visible vào đây
    { value: 'gps_tracking', label: 'Theo dõi GPS' }, // Giả định tính năng mới
];

const CreateTransportation = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        address: '', // Thêm trường địa chỉ
        average_price: '',
        description: '',
        rating: '',
        tags: [],
        features: [], // Bao gồm is_visible ở đây nếu bạn muốn nó là một tính năng
        icon: null,
        banner: null,
    });
    const [preview, setPreview] = useState({ icon: null, banner: null });
    const [submitting, setSubmitting] = useState(false);

    // Xử lý thay đổi input text/number
    const handleInput = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Xử lý thay đổi checkbox (tags và features)
    const handleCheckbox = useCallback((key, value) => {
        setForm((prev) => {
            const list = prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value];
            return { ...prev, [key]: list };
        });
    }, []);

    // Xử lý file upload
    const handleFile = useCallback((field, file) => {
        setForm((prev) => ({ ...prev, [field]: file }));
        if (file) {
            setPreview((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
        } else {
            setPreview((prev) => ({ ...prev, [field]: null }));
        }
    }, []);

    // Xử lý nút "Đặt lại"
    const handleReset = useCallback(() => {
        setForm({
            name: '',
            address: '',
            average_price: '',
            description: '',
            rating: '',
            tags: [],
            features: [],
            icon: null,
            banner: null,
        });
        setPreview({ icon: null, banner: null });
    }, []);

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (['tags', 'features'].includes(k)) {
                    // Chuyển đổi mảng tags/features thành JSON string để gửi đi
                    fd.append(k, JSON.stringify(v));
                } else if (v !== null) {
                    fd.append(k, v);
                }
            });

            // Nếu is_visible là một phần của features, không cần xử lý riêng
            // Nếu không, bạn cần thêm is_visible vào FormData riêng
            // Ví dụ: fd.append('is_visible', form.is_visible ? '1' : '0');

            await createTransportation(fd);
            alert('✅ Tạo mới phương tiện thành công!');
            navigate('/admin/transportations');
        } catch (error) {
            console.error('Lỗi khi tạo mới phương tiện:', error.response?.data || error.message);
            alert('❌ Tạo mới thất bại! Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-800">Thêm phương tiện mới</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <i className="fas fa-bell text-gray-600 text-lg"></i>
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                            1
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <img src="https://i.pravatar.cc/40?img=2" alt="Admin Avatar" className="w-8 h-8 rounded-full" />
                        <span className="text-gray-700 font-medium">Admin</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                    {/* Step Indicator */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800">Bắt đầu điền thông tin Phương tiện</h2>
                        <p className="text-sm text-gray-500">
                            Bạn đang thêm thông tin mới cho phương tiện.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                <i className="fas fa-info-circle mr-2 text-blue-500"></i> Thông tin cơ bản
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tên phương tiện */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên phương tiện <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInput}
                                        placeholder="Nhập tên phương tiện..."
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                
                                {/* Icon phương tiện */}
                                <div>
                                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon phương tiện</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group">
                                        <input
                                            id="icon"
                                            name="icon"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFile('icon', e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="space-y-1 text-center">
                                            {preview.icon ? (
                                                <img src={preview.icon} alt="Icon Preview" className="mx-auto h-20 w-20 object-contain rounded-md" />
                                            ) : (
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="icon" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Kéo thả file icon phương tiện</span>
                                                    <span className="sr-only">Choose file</span>
                                                </label>
                                                <p className="pl-1">hoặc</p>
                                                <label htmlFor="icon" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span className="ml-1">Chọn file</span>
                                                    <span className="sr-only">Upload file</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả chi tiết */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInput}
                                    rows={3}
                                    placeholder="Viết mô tả chi tiết về phương tiện..."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            {/* Địa chỉ */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInput}
                                    placeholder="Nhập địa chỉ chi tiết"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Giá trung bình */}
                                <div>
                                    <label htmlFor="average_price" className="block text-sm font-medium text-gray-700">Giá trung bình (VND)</label>
                                    <input
                                        type="number"
                                        id="average_price"
                                        name="average_price"
                                        value={form.average_price}
                                        onChange={handleInput}
                                        placeholder="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Hạng đánh giá */}
                                <div>
                                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Hạng đánh giá</label>
                                    <select
                                        id="rating"
                                        name="rating"
                                        value={form.rating}
                                        onChange={handleInput}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="">Chọn hạng đánh giá</option>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Hình ảnh */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                <i className="fas fa-image mr-2 text-purple-500"></i> Hình ảnh
                            </h3>
                            <div>
                                <label htmlFor="banner" className="block text-sm font-medium text-gray-700 sr-only">Banner chính</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group">
                                    <input
                                        id="banner"
                                        name="banner"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFile('banner', e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-1 text-center">
                                        {preview.banner ? (
                                            <img src={preview.banner} alt="Banner Preview" className="mx-auto h-32 object-contain rounded-md" />
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="banner" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Kéo thả hình ảnh vào đây</span>
                                                <span className="sr-only">Choose file</span>
                                            </label>
                                            <p className="pl-1">hoặc</p>
                                            <label htmlFor="banner" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span className="ml-1">Chọn file</span>
                                                <span className="sr-only">Upload file</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tags và Tính năng */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tags */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tags</h3>
                                <div className="space-y-2">
                                    {tags.map((t) => (
                                        <label key={t.value} className="flex items-center text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={form.tags.includes(t.value)}
                                                onChange={() => handleCheckbox('tags', t.value)}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                                            />
                                            {t.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tính năng */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tính năng</h3>
                                <div className="space-y-2">
                                    {features.map((f) => (
                                        <label key={f.value} className="flex items-center text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={form.features.includes(f.value)}
                                                onChange={() => handleCheckbox('features', f.value)}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                                            />
                                            {f.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-400 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleReset} // Sử dụng lại handleReset cho "Đặt lại" nếu hành vi giống nhau
                                className="px-5 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
                            >
                                Đặt lại
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-5 py-2 rounded-md font-medium text-white transition-colors
                                    ${submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {submitting ? 'Đang lưu...' : 'Lưu phương tiện'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateTransportation;