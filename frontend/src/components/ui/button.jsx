import React from "react"
import clsx from "clsx"

export const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={clsx("px-4 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 transition", className)}
      {...props}
    >
      {children}
    </button>
  )
}
