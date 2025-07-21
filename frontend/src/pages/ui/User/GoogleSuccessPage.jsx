import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function GoogleSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (token) {
      localStorage.setItem('token', token)
      navigate('/')
    } else {
      alert('Đăng nhập thất bại')
      navigate('/login')
    }
  }, [])

  return <p>Đang đăng nhập...</p>
}
