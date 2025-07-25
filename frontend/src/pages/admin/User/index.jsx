"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Bell, ChevronLeft, ChevronRight } from "lucide-react"
import AddUserForm from "./create"
import EditUserForm from "./edit"

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [showEditUserForm, setShowEditUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const stats = [
    { title: "Tổng người dùng", value: "12,789", color: "bg-white" },
    { title: "Hoạt động", value: "123", color: "bg-white" },
    { title: "Tạm Khóa", value: "345", color: "bg-white" },
    { title: "Mới hôm nay", value: "12", color: "bg-white" },
  ]

  const users = [
    {
      id: 1,
      name: "Nguyễn Thị A",
      email: "thinguyen@gmail.com",
      role: "Admin",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Quản trị viên hệ thống với 5 năm kinh nghiệm.",
      phone: "0987654321",
      bio: "Marketing specialist, chịu trách nhiệm về truyền thông.",
      gender: "female",
      birthDate: "15/03/1990",
    },
    {
      id: 2,
      name: "Nguyễn Thị B",
      email: "thinguyen@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Marketing specialist, chịu trách nhiệm về truyền thông.",
      phone: "0987654322",
      bio: "Chuyên viên marketing với kinh nghiệm 3 năm.",
      gender: "female",
      birthDate: "20/05/1995",
    },
    {
      id: 3,
      name: "Nguyễn Văn C",
      email: "vannguyen@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Developer với chuyên môn về React và Node.js.",
      phone: "0987654323",
      bio: "Full-stack developer, yêu thích công nghệ mới.",
      gender: "male",
      birthDate: "10/08/1992",
    },
    {
      id: 4,
      name: "Trần Thị D",
      email: "trand@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Designer với kinh nghiệm về UI/UX.",
      phone: "0987654324",
      bio: "UI/UX Designer, đam mê thiết kế sáng tạo.",
      gender: "female",
      birthDate: "25/12/1993",
    },
    {
      id: 5,
      name: "Lê Văn E",
      email: "levane@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Project Manager với 5 năm kinh nghiệm.",
      phone: "0987654325",
      bio: "Quản lý dự án, chuyên về Agile và Scrum.",
      gender: "male",
      birthDate: "05/07/1988",
    },
    {
      id: 6,
      name: "Phạm Thị F",
      email: "phamf@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "Content Writer và Social Media Manager.",
      phone: "0987654326",
      bio: "Chuyên viên nội dung và quản lý mạng xã hội.",
      gender: "female",
      birthDate: "18/11/1994",
    },
    {
      id: 7,
      name: "Hoàng Văn G",
      email: "hoangvang@gmail.com",
      role: "User",
      status: "Hoạt động",
      joinDate: "13/12/2024",
      description: "DevOps Engineer với chuyên môn về AWS.",
      phone: "0987654327",
      bio: "DevOps Engineer, chuyên về cloud infrastructure.",
      gender: "male",
      birthDate: "30/01/1991",
    },
  ]

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
      setSelectAll(false)
    } else {
      setSelectedUsers(users.map((user) => user.id))
      setSelectAll(true)
    }
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleBulkDelete = () => {
    console.log("Deleting users:", selectedUsers)
    setSelectedUsers([])
    setSelectAll(false)
    setIsSelectionMode(false)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditUserForm(true)
  }

  const handleCloseEditForm = () => {
    setShowEditUserForm(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      console.log("Deleting user:", userId)
      // Handle single user delete logic here
      // You can call your API to delete the user
    }
  }

  if (showAddUserForm) {
    return <AddUserForm onClose={() => setShowAddUserForm(false)} />
  }

  if (showEditUserForm) {
    return <EditUserForm user={selectedUser} onClose={handleCloseEditForm} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Quản lý người dùng</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white shadow-sm rounded-lg border">
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{stat.title}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm người dùng (id, tên)..."
              className="pl-10 w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
              onClick={() => setIsSelectionMode(!isSelectionMode)}
            >
              Chọn xóa
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center"
              onClick={() => setShowAddUserForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {isSelectionMode && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tham gia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">{user.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id.toString().padStart(3, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "Admin" ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joinDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate">{user.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-1 mt-6">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded min-w-[32px]">1</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">2</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">3</button>
          <span className="text-gray-500 px-2">...</span>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">19</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">Tiếp</button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Delete Button */}
      {isSelectionMode && selectedUsers.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-lg flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}

export default UserManagement
