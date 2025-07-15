import React from "react"

export const Select = ({ className = "", children, onValueChange, ...props }) => {
  return (
    <select
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      onChange={(e) => onValueChange?.(e.target.value)} // 👈 Bổ sung dòng này
      {...props}
    >
      {children}
    </select>
  )
}

export const SelectTrigger = ({ children, ...props }) => {
  return <>{children}</>
}

export const SelectValue = ({ placeholder }) => {
  return <option value="">{placeholder}</option>
}

export const SelectContent = ({ children }) => {
  return <>{children}</>
}

export const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>
}
