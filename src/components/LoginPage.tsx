'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, Lock, User, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Đăng nhập thất bại');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PlateSnap</h1>
              <p className="text-blue-200 text-sm">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Quản lý phương tiện<br />cư dân chung cư
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Hệ thống quản lý thông tin xe và cư dân hiện đại,
            giúp tra cứu nhanh chóng và quản lý hiệu quả.
          </p>

          <div className="flex gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-blue-200 text-sm">Phương tiện</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-blue-200 text-sm">Cư dân</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://nextia.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img
              src="https://nextia.vn/images/logo.png"
              alt="Nextia"
              className="h-6 object-contain brightness-0 invert"
            />
            <span className="text-blue-200 text-sm">Developed by Nextia</span>
          </a>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PlateSnap</h1>
              <p className="text-gray-500 text-sm">Admin Portal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại</h2>
              <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Tài khoản demo:{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-medium">
                  admin / admin123
                </code>
              </p>
            </div>
          </div>

          {/* Powered by Nextia - Mobile */}
          <div className="mt-6 flex justify-center lg:hidden">
            <a
              href="https://nextia.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition"
            >
              <img
                src="https://nextia.vn/images/logo.png"
                alt="Nextia"
                className="h-5 object-contain"
              />
              <span className="text-sm">Developed by Nextia</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
