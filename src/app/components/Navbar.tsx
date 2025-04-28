'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';
import Cookies from 'js-cookie';
import { Avatar } from '@mui/material'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Chat', href: '/chat' },
  { name: 'Follow', href: '/follow' }, 
  { name: 'TikTok', href: '/tiktok' },  
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter();

  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const avatar = useSelector((state: RootState) => state.auth.user?.avatar);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken)
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (accessToken && user && !token) {
      dispatch(loginSuccess({
        token: accessToken,
        user: JSON.parse(user),
      }));
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken');
    setTimeout(() => {
      router.push('/login');
    }, 1000)
    
  }

  const handleNavigateProfile = () => {
    router.push("/profile");
  }

  return (
    <header className="absolute fixed inset-x-0 top-0 z-50 bg-gray-400">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Social</span>
            <img
              alt="Logo"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </a>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm font-semibold text-gray-900">
              {item.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar
                key={avatar}
                src={avatar || 'https://via.placeholder.com/40'}
                alt="Avatar"
                className="h-10 w-10 rounded-full border-2 border-indigo-500 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
                onClick={handleNavigateProfile} 
              />
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <a href="/login" className="text-sm font-semibold text-gray-900">
              Log in/Register <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Dialog.Panel className="fixed inset-0 z-10 bg-white overflow-y-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Social</span>
                <img
                  alt="Logo"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="block py-2 text-base font-semibold text-gray-900">
                {item.name}
              </a>
            ))}
          </div>

          {user ? (
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="block py-2 text-base font-semibold text-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <a href="/login" className="block py-2 text-base font-semibold text-gray-900">
                Log in/Register
              </a>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
