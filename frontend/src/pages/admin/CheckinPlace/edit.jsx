import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getCheckinPlaceById,
    updateCheckinPlace,
} from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { fetchLocations } from "../../../services/ui/Location/locationService";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService";
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
    price: "",
    is_free: false,
    operating_hours: { open: "", close: "", all_day: false },
    transport_options: [],
    status: "active",
    note: "",
    gallery: [],
    old_gallery: [],
    location_id: "",
    region: "",
    distance: "",
};

export default function EditCheckinPlace() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [locations, setLocations] = useState([]);
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const regionOptions = [
        { value: "", label: "--Chọn miền/khu vực--" },
        { value: "Bắc", label: "Miền Bắc" },
        { value: "Trung", label: "Miền Trung" },
        { value: "Nam", label: "Miền Nam" },
    ];

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

                const transportResponse = await getAllTransportations();
                if (transportResponse && transportResponse.data && Array.isArray(transportResponse.data.data)) {
                    setTransportationTypes(transportResponse.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", transportResponse);
                    setTransportationTypes([]);
                }

                if (id) {
                    const { data } = await getCheckinPlaceById(id);
                    const d = data.data;

                    const parseJSON = (val, def) => {
                        try {
                            return val ? JSON.parse(val) : def;
                        } catch {
                            return def;
                        }
                    };

                    const ensureArray = (value, fallback = []) => {
                        if (Array.isArray(value)) {
                            return value.length > 0 ? value : fallback;
                        }
                        if (typeof value === "string" && value) {
                            try {
                                const parsed = JSON.parse(value);
                                if (Array.isArray(parsed))
                                    return parsed.length > 0 ? parsed : fallback;
                            } catch (e) {
                                // Ignore JSON parse error, try splitting by comma
                            }
                            const splitValue = value
                                .split(",")
                                .map((item) => item.trim())
                                .filter((item) => item !== "");
                            return splitValue.length > 0 ? splitValue : fallback;
                        }
                        return fallback;
                    };

                    let parsedOperatingHours = parseJSON(d.operating_hours, {
                        open: "",
                        close: "",
                        all_day: false,
                    });

                    if (Array.isArray(parsedOperatingHours) && parsedOperatingHours.length > 0) {
                        parsedOperatingHours = parsedOperatingHours[0];
                    } else if (!parsedOperatingHours || typeof parsedOperatingHours !== "object") {
                        parsedOperatingHours = { open: "", close: "", all_day: false };
                    }
                    if (typeof d.operating_hours?.all_day !== "undefined") {
                        parsedOperatingHours.all_day = d.operating_hours.all_day;
                    } else {
                        parsedOperatingHours.all_day = false;
                    }

                    const getImageUrl = (path) => {
                        if (!path) return null;
                        if (path.startsWith("http://") || path.startsWith("https://")) {
                            return path;
                        }
                        return `http://localhost:8000/storage/${path}`;
                    };

                    setForm({
                        ...initialForm,
                        name: d.name ?? "",
                        description: d.description ?? "",
                        address: d.address ?? "",
                        latitude: d.latitude ? String(d.latitude) : "",
                        longitude: d.longitude ? String(d.longitude) : "",
                        old_image: getImageUrl(d.image),
                        old_gallery: ensureArray(d.images, []).map((img) => getImageUrl(img)),
                        rating: d.rating ? String(d.rating) : "",
                        is_free: !!d.is_free,
                        price: d.price ? String(d.price) : "",
                        transport_options: ensureArray(d.transport_options, []),
                        status: d.status ?? "active",
                        note: d.caption ?? "",
                        operating_hours: parsedOperatingHours,
                        distance: d.distance ? String(d.distance) : "",
                        region: d.region ?? "",
                        location_id: d.location_id ?? "",
                    });
                    if (d.latitude && d.longitude) {
                        setShowMap(true);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu hoặc dữ liệu địa điểm:", error);
                alert("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
                navigate("/admin/checkin-places");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

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

        if (name === "all_day" || name === "open" || name === "close") {
            setForm((p) => ({
                ...p,
                operating_hours: {
                    ...p.operating_hours,
                    [name]: finalValue,
                },
            }));
        } else {
            setForm((p) => ({ ...p, [name]: finalValue }));
        }
        setErrors((p) => ({ ...p, [name]: undefined, [`operating_hours.${name}`]: undefined }));
    }, []);

    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";

        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
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

    const addTransportOption = useCallback(() => {
        setForm((p) => ({ ...p, transport_options: [...p.transport_options, ""] }));
    }, []);

    const changeTransportOption = useCallback((idx, value) => {
        const next = [...form.transport_options];
        next[idx] = value;
        setForm((p) => ({ ...p, transport_options: next }));
        setErrors((p) => ({ ...p, transport_options: undefined }));
    }, [form.transport_options]);

    const removeTransportOption = useCallback((idx) => {
        setForm((p) => ({ ...p, transport_options: p.transport_options.filter((_, i) => i !== idx) }));
        setErrors((p) => ({ ...p, transport_options: undefined }));
    }, []);

    const validateForm = useCallback(() => {
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
        if (form.latitude === "" || form.longitude === "" || isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
            newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
        }
        if (form.rating && (isNaN(parseFloat(form.rating)) || parseFloat(form.rating) < 0 || parseFloat(form.rating) > 5)) {
            newErrors.rating = "Hạng đánh giá phải là một số từ 0 đến 5.";
        }
        if (!form.is_free && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)) {
            newErrors.price = "Giá phải là một số không âm.";
        }
        if (!form.operating_hours.all_day) {
            if (!form.operating_hours.open) {
                newErrors[`operating_hours.open`] = "Giờ mở cửa không được để trống.";
            }
            if (!form.operating_hours.close) {
                newErrors[`operating_hours.close`] = "Giờ đóng cửa không được để trống.";
            }
            if (form.operating_hours.open && form.operating_hours.close && form.operating_hours.open >= form.operating_hours.close) {
                newErrors[`operating_hours.close`] = "Giờ đóng cửa phải sau giờ mở cửa.";
            }
        }
        if (!form.old_image && !form.image) {
            newErrors.image = "Vui lòng tải lên ảnh chính.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

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
            fd.append("_method", "PUT");

            Object.entries(form).forEach(([k, v]) => {
                if (
                    [
                        "image",
                        "old_image",
                        "gallery",
                        "old_gallery",
                        "transport_options", // Exclude for manual handling below
                        "operating_hours",   // Exclude for manual handling below
                        "checkin_count",
                        "review_count",
                    ].includes(k)
                ) {
                    return;
                }

                if (k === "is_free") {
                    fd.append("is_free", v ? "1" : "0");
                } else if (k === "note") {
                    fd.append("caption", v || "");
                } else if (k === "location_id") {
                    if (v !== null && v !== "") {
                        fd.append("location_id", v);
                    }
                } else if (v !== "" && v !== null && typeof v !== 'object') {
                    fd.append(k, v);
                }
            });

            if (form.image instanceof File) {
                fd.append("image", form.image);
            }

            form.gallery.forEach((f, i) => {
                if (f instanceof File) {
                    fd.append(`images[${i}]`, f);
                }
            });

            form.old_gallery.forEach((p) => {
                const path = p.startsWith("http://localhost:8000/storage/")
                    ? p.replace("http://localhost:8000/storage/", "")
                    : p;
                if (path) {
                    fd.append("old_images[]", path);
                }
            });

            // Corrected: JSON.stringify transport_options to send as a single string
            fd.append("transport_options", JSON.stringify(form.transport_options.filter(t => t.trim() !== "")));
            fd.append("operating_hours", JSON.stringify(form.operating_hours));

            await updateCheckinPlace(id, fd);
            alert("✅ Đã lưu thay đổi");
            navigate("/admin/checkin-places");
        } catch (err) {
            console.error("Lỗi cập nhật:", err.response?.data || err.message);
            if (err.response && err.response.data && err.response.data.errors) {
                const backendErrors = err.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                alert("❌ Có lỗi xảy ra. Vui lòng kiểm tra lại các trường bị lỗi.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Đang tải dữ liệu địa điểm...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <header className="mb-4 flex items-center gap-3">
                <i className="fas fa-edit text-2xl text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-800">
                    Chỉnh sửa điểm check-in
                </h1>
            </header>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-map-marker-alt" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">
                            Cập nhật thông tin địa điểm
                        </p>
                        <p className="text-xs text-gray-500">
                            Điền thông tin cần sửa và lưu lại
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 p-6">
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

                        <Select
                            name="region"
                            label="Miền / Khu vực"
                            value={form.region}
                            onChange={handleChange}
                            options={regionOptions}
                        />
                        {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}

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

                            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                                {/* Ô nhập vĩ độ */}
                                <input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude === "" ? "" : parseFloat(form.latitude)}
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`w-full rounded-md border p-2 text-sm bg-white shadow-sm ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}

                                />

                                {/* Nút mở bản đồ */}
                                <button
                                    type="button"
                                    className="h-full rounded-md bg-blue-500 px-3 py-2 text-white shadow hover:bg-blue-600 transition"
                                    title="Chọn tọa độ trên bản đồ"
                                    onClick={() => setShowMap((s) => !s)}
                                >
                                    <i className="fas fa-map-marker-alt" />
                                </button>

                                {/* Ô nhập kinh độ */}
                                <input
                                    type="number"
                                    name="longitude"
                                    value={form.longitude === "" ? "" : parseFloat(form.longitude)}
                                    onChange={handleChange}
                                    placeholder="Kinh độ"
                                    step="0.000001"
                                    className={`w-full rounded-md border p-2 text-sm bg-white shadow-sm ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}

                                />

                                {/* Nút reset */}
                                <button
                                    type="button"
                                    className="h-full rounded-md bg-gray-500 px-3 py-2 text-white shadow hover:bg-gray-600 transition"
                                    title="Đặt lại tọa độ"
                                    onClick={() => {
                                        setForm((p) => ({ ...p, latitude: "", longitude: "" }));
                                        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
                                        alert("Đã đặt lại tọa độ về rỗng.");
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>

                            {/* Hiển thị lỗi nếu có */}
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}

                            {/* Gợi ý hướng dẫn */}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể <strong>nhập trực tiếp tọa độ</strong> vào các ô trên, hoặc nhấn vào biểu tượng
                                <i className="fas fa-map-marker-alt text-blue-700 mx-1"></i>
                                để mở bản đồ và chọn vị trí. Tọa độ sẽ tự động hiển thị sau khi bạn chọn.
                            </p>

                            {/* Bản đồ nếu được bật */}
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

                    <Section title="Hình ảnh" icon="fas fa-image">
                        {form.old_image && (
                            <div className="mb-4 space-y-2">
                                <Label text="Ảnh bìa hiện tại" />
                                <img
                                    src={form.old_image}
                                    alt="Ảnh bìa hiện tại"
                                    className="h-48 w-full rounded-md object-cover shadow-sm"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            "https://via.placeholder.com/400x200?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                        )}
                        <Label text="Ảnh chính mới (nếu thay đổi)" />
                        <DropZone
                            file={form.image || form.old_image}
                            onRemove={() => setForm((p) => ({ ...p, image: null, old_image: null }))}
                            onChange={(e) => handleFile(e, "image")}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

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
                    </Section>

                    <Section title="Chi tiết địa điểm" icon="fas fa-clipboard-list">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    name="rating"
                                    label="Đánh giá (0-5)"
                                    type="number"
                                    value={form.rating}
                                    onChange={handleChange}
                                    placeholder="4.5"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                />
                                {errors.rating && <p className="text-red-500 text-xs">{errors.rating}</p>}

                                <div className="space-y-2">
                                    <Label text="Giờ hoạt động" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput
                                            label="Giờ mở cửa"
                                            name="open"
                                            value={form.operating_hours.open}
                                            onChange={handleChange}
                                            required={!form.operating_hours.all_day}
                                            disabled={form.operating_hours.all_day}
                                        />
                                        <TimeInput
                                            label="Giờ đóng cửa"
                                            name="close"
                                            value={form.operating_hours.close}
                                            onChange={handleChange}
                                            required={!form.operating_hours.all_day}
                                            disabled={form.operating_hours.all_day}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            name="all_day"
                                            checked={form.operating_hours.all_day}
                                            onChange={handleChange}
                                        />
                                        Tất cả thời gian
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label text="Giá vé" />
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="is_free"
                                                checked={!form.is_free}
                                                onChange={() => setForm((p) => ({ ...p, is_free: false, price: "" }))}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span>Có phí</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="is_free"
                                                checked={form.is_free}
                                                onChange={() => setForm((p) => ({ ...p, is_free: true, price: "" }))}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span>Miễn phí</span>
                                        </label>
                                    </div>
                                    {!form.is_free && (
                                        <Input
                                            name="price"
                                            type="number"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="Giá vé (VNĐ)"
                                            min="0"
                                        />
                                    )}
                                    {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label text="Phương tiện di chuyển" />
                                    {form.transport_options.map((option, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Select
                                                value={option}
                                                onChange={(e) => changeTransportOption(idx, e.target.value)}
                                                options={[
                                                    { value: "", label: "--Chọn phương tiện--" },
                                                    ...transportationTypes.map((type) => ({
                                                        value: type.name,
                                                        label: type.name,
                                                    })),
                                                ]}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeTransportOption(idx)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTransportOption}
                                        className="mt-2 flex items-center gap-1 rounded-md bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                                    >
                                        <i className="fas fa-plus"></i> Thêm phương tiện
                                    </button>
                                    {errors.transport_options && <p className="text-red-500 text-xs">{errors.transport_options}</p>}
                                </div>
                            </div>
                        </div>
                    </Section>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/checkin-places")}
                            className="flex items-center gap-2 rounded-md bg-gray-300 px-6 py-2 text-gray-800 transition-colors hover:bg-gray-400"
                        >
                            <i className="fas fa-arrow-left"></i> Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors ${isSubmitting ? "cursor-not-allowed opacity-75" : "hover:bg-blue-700"
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i> Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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

const TimeInput = ({ label, value, onChange, name, required, disabled }) => (
    <div className="space-y-1">
        <Label text={label} />
        <input
            type="time"
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);