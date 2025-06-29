import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCheckinPlaceById,
  updateCheckinPlace,
  deleteCheckinPhoto,
} from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { fetchLocations } from "../../../services/ui/Location/locationService";
import { getAllTransportations } from  "../../../services/ui/Transportation/transportationService";
import LocationSelectorMap from "../../../common/LocationSelectorMap";

/**
 * EditCheckinPlace - giao diện chỉnh sửa địa điểm check-in
 * 👉 Layout, màu sắc, UI primitives giống hệt CreateCheckinPlace.jsx để đảm bảo nhất quán.
 */

// Các component UI nhỏ được định nghĩa lại để khớp với cách bạn sử dụng
// (Giả định bạn có các component này ở nơi khác hoặc chúng là inline components đơn giản)

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
        <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full rounded-md object-cover" />
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

const TimeInput = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <Label text={label} />
    <input
      type="time"
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
    />
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


const initialForm = {
  name: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  image: null,
  old_image: null,
  gallery: [],
  old_gallery: [],
  rating: "",
  price: "",
  is_free: false,
  transport_options: [], // Thay đổi từ [""] sang [] để xử lý mảng
  status: "active",
  note: "",
  checkin_count: 0,
  review_count: 0,
  operating_hours: { open: "", close: "" },
  distance: "",
  region: "",
  location_id: "",
};

export default function EditCheckinPlace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Effect để fetch danh sách loại phương tiện khi component được mount
  useEffect(() => {
    const getTransportationTypes = async () => {
      try {
        // Đã sửa để gọi getAllTransportations từ service mới
        const response = await getAllTransportations(); 
        if (response && response.data && Array.isArray(response.data.data)) { // API trả về { success: true, data: [...] }
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

  /* ----------------------------- fetch data for current checkin place ----------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCheckinPlaceById(id);
        const d = data.data;

        // parse helpers
        const parseJSON = (val, def) => {
          try {
            return val ? JSON.parse(val) : def;
          } catch {
            return def;
          }
        };

        // Hàm để chuẩn hóa mảng (chuyển chuỗi JSON hoặc chuỗi comma-separated thành mảng)
        // Đã cập nhật để đảm bảo trả về ít nhất một chuỗi rỗng nếu mảng rỗng
        const ensureArray = (value, fallback = []) => {
          if (Array.isArray(value)) {
              return value.length > 0 ? value : fallback; // Nếu là mảng nhưng rỗng, trả về fallback
          }
          if (typeof value === 'string' && value) {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : fallback; // Nếu parsed là mảng rỗng, trả về fallback
            } catch (e) {
              // Ignore JSON parse error, try splitting by comma
            }
            const splitValue = value.split(',').map(item => item.trim()).filter(item => item !== "");
            return splitValue.length > 0 ? splitValue : fallback; // Nếu split rỗng, trả về fallback
          }
          return fallback;
        };

        // Điều chỉnh cách parse operating_hours: đảm bảo nó luôn là một đối tượng {open, close}
        let parsedOperatingHours = parseJSON(d.operating_hours, { open: "", close: "" });
        if (Array.isArray(parsedOperatingHours) && parsedOperatingHours.length > 0) {
            parsedOperatingHours = parsedOperatingHours[0]; 
        } else if (!parsedOperatingHours || typeof parsedOperatingHours !== 'object') {
            parsedOperatingHours = { open: "", close: "" };
        }

        setForm({
          ...initialForm,
          name: d.name ?? "",
          description: d.description ?? "",
          address: d.address ?? "",
          latitude: d.latitude ?? "",
          longitude: d.longitude ?? "",
          old_image: d.image ?? null,
          old_gallery: ensureArray(d.images, []),
          rating: d.rating ?? "",
          is_free: !!d.is_free,
          price: d.price ?? "",
          // Đảm bảo transport_options luôn có ít nhất một slot nếu không có dữ liệu
          transport_options: ensureArray(d.transport_options, [""]), // <-- ĐÃ SỬA: Thay [] bằng [""]
          status: d.status ?? "active",
          note: d.caption ?? "",
          checkin_count: d.checkin_count ?? 0,
          review_count: d.review_count ?? 0,
          operating_hours: parsedOperatingHours,
          distance: d.distance ?? "",
          region: d.region ?? "",
          location_id: d.location_id ?? "",
          checkin_photos: d.checkin_photos ?? [],
        });
        if (d.latitude && d.longitude) {
            setShowMap(true);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu địa điểm:", err);
        alert("Không thể tải dữ liệu địa điểm. Vui lòng thử lại.");
        navigate("/admin/checkin-places");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* -------------------------- form helpers ------------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = name === 'location_id' && value === '' ? null : value;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : finalValue }));
  };

  const handleLocation = (lat, lng) => {
    setForm((p) => ({ ...p, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  const handleFile = (e, field, idx = null) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    if (field === "image") setForm((p) => ({ ...p, image: f }));
    else if (field === "gallery") {
      const next = [...form.gallery];
      if (idx === null) next.push(f);
      else next[idx] = f;
      setForm((p) => ({ ...p, gallery: next }));
    }
  };

  const addGallerySlot = () => setForm((p) => ({ ...p, gallery: [...p.gallery, null] }));
  const removeGallery = (idx) =>
    setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
  const removeOldGallery = (idx) =>
    setForm((p) => ({ ...p, old_gallery: p.old_gallery.filter((_, i) => i !== idx) }));

  // addArrayItem đã đúng để thêm một chuỗi rỗng
  const addArrayItem = (field) =>
    setForm((p) => ({ ...p, [field]: [...p[field], ""] })); 
  const changeArrayItem = (field, idx, v) => {
    const next = [...form[field]];
    next[idx] = v;
    setForm((p) => ({ ...p, [field]: next }));
  };
  const removeArrayItem = (field, idx) =>
    setForm((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));

  /* ---------------------------- submit ---------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append("_method", "PUT"); // Quan trọng cho Laravel

    // Append standard fields
    Object.entries(form).forEach(([k, v]) => {
      if (
        [
          "image",
          "old_image",
          "gallery",
          "old_gallery",
          "transport_options", // Xử lý riêng
          "operating_hours",   // Xử lý riêng
          "checkin_photos",
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
      }
      else if (v !== "" && v !== null) {
        fd.append(k, v);
      }
    });

    // Handle single image (main image)
    if (form.image instanceof File) {
      fd.append("image", form.image);
    }

    // Handle new gallery images
    form.gallery.forEach((f, i) => {
      if (f instanceof File) {
        fd.append(`images[${i}]`, f);
      }
    });

    // Handle existing gallery images (send their paths to keep them)
    form.old_gallery.forEach((p) => {
      const path = p.startsWith('http://localhost:8000/storage/') ? p.replace('http://localhost:8000/storage/', '') : p;
      if (path) {
        fd.append("old_images[]", path);
      }
    });

    // Handle transport options - Gửi dưới dạng từng phần tử riêng lẻ để Laravel nhận biết mảng
    // Vẫn lọc bỏ các giá trị rỗng để tránh gửi các option trống
    form.transport_options.filter(t => t.trim() !== '').forEach((t, i) => {
        fd.append(`transport_options[${i}]`, t.trim());
    });

    // Handle operating hours - Gửi dưới dạng các trường riêng lẻ để Laravel nhận biết mảng chứa đối tượng
    if (form.operating_hours.open || form.operating_hours.close) {
        fd.append("operating_hours[0][open]", form.operating_hours.open || "");
        fd.append("operating_hours[0][close]", form.operating_hours.close || "");
    } else {
        // Gửi một mảng rỗng nếu không có giờ nào được nhập
        fd.append("operating_hours", JSON.stringify([])); 
    }

    try {
      await updateCheckinPlace(id, fd);
      alert("✅ Đã lưu thay đổi");
      navigate("/admin/checkin-places");
    } catch (err) {
      console.error("Lỗi cập nhật:", err.response?.data || err.message);
      alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUserPhoto = async (pid) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá ảnh check-in này?")) return;
    try {
      await deleteCheckinPhoto(pid);
      setForm((p) => ({
        ...p,
        checkin_photos: p.checkin_photos.filter((ph) => ph.id !== pid),
      }));
      alert("Đã xoá ảnh");
    } catch (err) {
      console.error("Lỗi xóa ảnh check-in:", err.response?.data || err.message);
      alert("Không thể xoá ảnh" + (err.response?.data?.message || err.message));
    }
  };

  /* ----------------------------- view ---------------------------- */
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-xl text-gray-700">
        🔄 Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* heading */}
      <header className="mb-4 flex items-center gap-3">
        <i className="fas fa-edit text-2xl text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa điểm check-in</h1>
      </header>

      <div className="rounded-lg bg-white shadow-lg">
        {/* step header */}
        <div className="flex items-center gap-3 border-b p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
            <i className="fas fa-map-marker-alt" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Cập nhật thông tin địa điểm</p>
            <p className="text-xs text-gray-500">Điền thông tin cần sửa và lưu lại</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-10 p-6">
          {/* 1. Info */}
          <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
            <Input
              name="name"
              label={<Label text="Tên địa điểm" />}
              required
              value={form.name}
              onChange={handleChange}
            />
            <Textarea
              name="description"
              label="Mô tả"
              value={form.description}
              onChange={handleChange}
            />
            <Input name="address" label="Địa chỉ" value={form.address} onChange={handleChange} />

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

            {/* coords */}
            <div className="space-y-2">
              <Label text="Tọa độ" icon="fas fa-map-marked-alt" />
              <div className="flex gap-2">
                <Input
                  name="latitude"
                  value={form.latitude}
                  readOnly
                  placeholder="Vĩ độ"
                />
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-3 text-white transition-colors hover:bg-blue-600"
                  onClick={() => setShowMap((s) => !s)}
                >
                  <i className="fas fa-map-marker-alt" />
                </button>
                <Input
                  name="longitude"
                  value={form.longitude}
                  readOnly
                  placeholder="Kinh độ"
                />
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-3 text-white transition-colors hover:bg-blue-600"
                  onClick={() => setForm((p) => ({ ...p, latitude: "", longitude: "" }))}
                >
                  <i className="fas fa-sync" />
                </button>
              </div>
              {showMap && (
                <div className="overflow-hidden rounded-md border">
                  <LocationSelectorMap
                    initialLatitude={parseFloat(form.latitude) || null}
                    initialLongitude={parseFloat(form.longitude) || null}
                    onLocationSelect={handleLocation}
                  />
                </div>
              )}
            </div>
          </Section>

          {/* 2. Images */}
          <Section title="Hình ảnh" icon="fas fa-image">
            {/* cover */}
            {form.old_image && (
              <div className="mb-4 space-y-2">
                <Label text="Ảnh bìa hiện tại" />
                <img
                  src={`http://localhost:8000/storage/${form.old_image}`}
                  alt="Ảnh bìa hiện tại"
                  className="h-48 w-full rounded-md object-cover shadow-sm"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }}
                />
              </div>
            )}
            <Label text="Ảnh bìa mới (nếu thay đổi)" />
            <DropZone
              file={form.image}
              onRemove={() => setForm((p) => ({ ...p, image: null }))}
              onChange={(e) => handleFile(e, "image")}
            />

            {/* gallery existing images */}
            {(form.old_gallery && form.old_gallery.length > 0) && (
              <div className="space-y-2 pt-4">
                <Label text="Ảnh thư viện hiện tại" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {form.old_gallery.map((img, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-md shadow-sm">
                      <img
                        src={`http://localhost:8000/storage/${img}`}
                        alt={`Thư viện ảnh ${idx + 1}`}
                        className="h-28 w-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x70?text=Error'; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeOldGallery(idx)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        title="Xóa ảnh này"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* gallery new images */}
            <div className="space-y-2 pt-4">
              <Label text="Thêm ảnh thư viện mới" />
              {form.gallery.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <DropZone
                    file={file}
                    onRemove={() => handleFile({ target: { files: [] } }, "gallery", idx)}
                    onChange={(e) => handleFile(e, "gallery", idx)}
                  />
                  <button
                    type="button"
                    onClick={() => removeGallery(idx)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGallerySlot}
                className="mt-2 flex items-center gap-1 rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600"
              >
                <i className="fas fa-plus"></i> Thêm ảnh
              </button>
            </div>
          </Section>

          {/* 3. Details */}
          <Section title="Chi tiết địa điểm" icon="fas fa-clipboard-list">
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

            {/* Giá vé */}
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
            </div>

            {/* Giờ hoạt động */}
            <div className="space-y-2">
              <Label text="Giờ hoạt động" />
              <div className="grid grid-cols-2 gap-4">
                <TimeInput
                  label="Giờ mở cửa"
                  value={form.operating_hours.open}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      operating_hours: { ...p.operating_hours, open: e.target.value },
                    }))
                  }
                />
                <TimeInput
                  label="Giờ đóng cửa"
                  value={form.operating_hours.close}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      operating_hours: { ...p.operating_hours, close: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <Input
              name="distance"
              label="Khoảng cách (km)"
              type="number"
              value={form.distance}
              onChange={handleChange}
              placeholder="Khoảng cách từ trung tâm (km)"
              step="0.1"
              min="0"
            />
            <Input
              name="checkin_count"
              label="Số lượt check-in"
              type="number"
              value={form.checkin_count}
              onChange={handleChange}
              min="0"
            />
            <Input
              name="review_count"
              label="Số lượt đánh giá"
              type="number"
              value={form.review_count}
              onChange={handleChange}
              min="0"
            />

            {/* Transport Options - Updated to use Select component */}
            <div className="space-y-2">
              <Label text="Phương tiện di chuyển" />
              {form.transport_options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={option}
                    onChange={(e) => changeArrayItem("transport_options", idx, e.target.value)}
                    options={[
                        { value: "", label: "--Chọn phương tiện--" },
                        // Map transportationTypes để tạo options, sử dụng 'name' làm cả value và label
                        ...transportationTypes.map((type) => ({ value: type.name, label: type.name })),
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem("transport_options", idx)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("transport_options")}
                className="mt-2 flex items-center gap-1 rounded-md bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600"
              >
                <i className="fas fa-plus"></i> Thêm phương tiện
              </button>
            </div>
          </Section>

          {/* 4. Other */}
          <Section title="Khác" icon="fas fa-cog">
            <Input
              name="region"
              label="Miền"
              value={form.region}
              onChange={handleChange}
              placeholder="Miền (Bắc, Trung, Nam)"
            />
            <Textarea
              name="note"
              label="Ghi chú / Chú thích"
              value={form.note}
              onChange={handleChange}
              placeholder="Thêm ghi chú hoặc chú thích đặc biệt"
            />
            <div className="space-y-2">
              <Label text="Trạng thái" />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </Section>

          {/* 5. User Checkin Photos (Read-only, with delete option) */}
          {form.checkin_photos && form.checkin_photos.length > 0 && (
            <Section title="Ảnh check-in từ người dùng" icon="fas fa-users">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {form.checkin_photos.map((photo) => (
                  <div key={photo.id} className="relative group overflow-hidden rounded-md shadow-sm">
                    <img
                      src={`http://localhost:8000/storage/${photo.image}`}
                      alt={`Ảnh check-in của ${photo.user_name || 'người dùng'}`}
                      className="h-28 w-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x70?text=Error'; }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteUserPhoto(photo.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      title="Xóa ảnh check-in này"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    {photo.user_name && (
                      <p className="absolute bottom-1 left-1 rounded bg-black bg-opacity-50 px-1 py-0.5 text-xs text-white">
                        {photo.user_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Actions */}
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
              disabled={saving}
              className={`flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors ${
                saving ? "cursor-not-allowed opacity-75" : "hover:bg-blue-700"
              }`}
            >
              {saving ? (
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
