// src/components/admin/AdminLayout.jsx
import Sidebar from "./Sidebar"


export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Nội dung bên phải */}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
