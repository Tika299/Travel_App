"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bell, MapPin, Upload, Map } from "lucide-react";
import { restaurantAPI } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: "",
    price_range: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [externalChange, setExternalChange] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === `Admin/EditRestaurant/${id}` && event.newValue) {
        setExternalChange(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await restaurantAPI.getById(id);
        const restaurant = res.data.data;

        setForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          rating: restaurant.rating
            ? String(Math.round(restaurant.rating))
            : "",

          price_range: restaurant.price_range || "",
          address: restaurant.address || "",
          latitude: restaurant.latitude || "",
          longitude: restaurant.longitude || "",
          image: null,
        });
        setInitialForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          address: restaurant.address || "",
          latitude: restaurant.latitude || "",
          longitude: restaurant.longitude || "",
          rating: restaurant.rating || "",
          price_range: restaurant.price_range || "",
          image: "", // ảnh không cần so
        });
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhà hàng:", err);
        setError("Không thể tải dữ liệu nhà hàng.");
      }
    };

    fetchData();
  }, [id]);
  useEffect(() => {
    if (form && id) {
      localStorage.setItem(`Admin/EditRestaurant/${id}`, JSON.stringify(form));
    }
  }, [form, id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setForm((prev) => ({ ...prev, image: file }));
        setError(null);
      } else {
        setError("Vui lòng chọn một file hình ảnh hợp lệ.");
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleReset = () => {
    setForm({
      name: "",
      description: "",
      rating: "",
      price_range: "",
      address: "",
      latitude: "",
      longitude: "",
      image: null,
    });
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (externalChange) {
      setShowConfirmModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("rating", form.rating);
    formData.append("price_range", form.price_range);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("address", form.address);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await restaurantAPI.update(id, formData);
      navigate("/Admin/Restaurant");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setError("Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };
  const proceedSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitPending(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("rating", form.rating);
    formData.append("price_range", form.price_range);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("address", form.address);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await restaurantAPI.update(id, formData);
      navigate("/Admin/Restaurant");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      setError("Cập nhật thất bại.");
    } finally {
      setLoading(false);
      setSubmitPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-[#ebebeb] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#000000]">
          Thêm nhà hàng/quán ăn
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-5 h-5 text-[#8b8b8b]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f73333] rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-[#000000]">Admin</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4 text-[#000000]">
                  Dữ liệu đã thay đổi
                </h2>
                <p className="text-sm text-[#444] mb-6">
                  Dữ liệu nhà hàng đã thay đổi từ một tab khác. Bạn có chắc chắn
                  muốn ghi đè?
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-[#02abff] hover:bg-[#0554ff] text-white"
                    onClick={proceedSubmit}
                    disabled={submitPending}
                  >
                    {submitPending ? "Đang lưu..." : "Vẫn tiếp tục lưu"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <CardContent className="p-6">
            {/* Info Banner */}
            <div className="bg-[#e3f2fd] border border-[#02abff] rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="w-5 h-5 bg-[#02abff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-[#000000] mb-1">
                  Bắt đầu điền thông tin nhà hàng/quán ăn
                </div>
                <div className="text-sm text-[#8b8b8b]">
                  Điền đầy đủ thông tin để thêm nhà hàng/quán ăn mới
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {externalChange && (
              <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                ⚠️ Dữ liệu nhà hàng đang được chỉnh sửa từ một tab khác. Hãy
                kiểm tra lại để tránh mất dữ liệu!
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[#02abff] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="font-medium text-[#000000]">
                  Thông tin cơ bản
                </span>
              </div>

              {/* Restaurant Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Tên nhà hàng/quán ăn <span className="text-[#f73333]">*</span>
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên nhà hàng/quán ăn..."
                  className="border-[#ebebeb]"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Mô tả
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Viết mô tả chi tiết về nhà hàng/quán ăn..."
                  className="border-[#ebebeb] min-h-[100px]"
                  rows={4}
                  required
                />
              </div>

              {/* Rating Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#000000]">
                    Đánh giá
                  </label>
                  <Select
                    value={form.rating}
                    onValueChange={(value) =>
                      handleSelectChange("rating", value)
                    }
                  >
                    <SelectTrigger className="border-[#ebebeb]">
                      <SelectValue placeholder="-- Chọn đánh giá --" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {star} sao
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#000000]">
                    Khoảng giá
                  </label>
                  <Select
                    value={form.price_range}
                    onValueChange={(value) =>
                      handleSelectChange("price_range", value)
                    }
                  >
                    <SelectTrigger className="border-[#ebebeb]">
                      <SelectValue placeholder="Chọn mức giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100,000 - 300,000 VND">
                        100,000 - 300,000 VND
                      </SelectItem>
                      <SelectItem value="500,000 - 800,000 VND">
                        500,000 - 800,000 VND
                      </SelectItem>
                      <SelectItem value="1,000,000 - 1,500,000 VND">
                        1,000,000 - 1,500,000 VND
                      </SelectItem>
                      <SelectItem value="Trên 1,800,000 VND">
                        Trên 1,800,000 VND
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Địa chỉ
                </label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ chi tiết"
                  className="border-[#ebebeb]"
                  required
                />
              </div>

              {/* Coordinates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#02abff]" />
                  <span className="text-sm font-medium text-[#02abff]">
                    Tọa độ địa lý
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000000]">
                      Kinh độ
                    </label>
                    <div className="relative">
                      <Input
                        name="longitude"
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={handleChange}
                        placeholder="105.0345"
                        className="border-[#ebebeb] pr-10"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 bg-[#02abff] rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000000]">
                      Vĩ độ
                    </label>
                    <div className="relative">
                      <Input
                        name="latitude"
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        value={form.latitude}
                        onChange={handleChange}
                        placeholder="21.0286"
                        className="border-[#ebebeb] pr-10"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 bg-[#02abff] rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info Banner */}
                <div className="bg-[#e3f2fd] border border-[#02abff] rounded-lg p-3 flex items-start gap-2">
                  <div className="w-4 h-4 bg-[#02abff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">
                    Nhấn vào nút bản đồ để chọn tọa độ trực tiếp trên bản đồ
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Ảnh chính
                </label>
                <div className="border-2 border-dashed border-[#ebebeb] rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#8b8b8b]" />
                    </div>
                    <div>
                      <div className="text-[#8b8b8b] mb-1">
                        Kéo thả hình ảnh vào đây
                      </div>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="text-[#02abff] p-0 h-auto"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        Chọn file
                      </Button>
                    </div>
                    {form.image && (
                      <div className="text-sm text-green-600 mt-2">
                        Đã chọn: {form.image.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#ebebeb]">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#8b8b8b] text-[#8b8b8b] bg-transparent"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#000000] text-[#000000] bg-[#8b8b8b] text-white"
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  className="bg-[#02abff] hover:bg-[#0554ff] text-white"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu nhà hàng/quán ăn"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditRestaurant;
