"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // En producción, esto debería ser una llamada a una API segura
    // Por ahora, ejemplo simple de validación
    const ADMIN_PASSWORD = 'sirius-admin-2024'; // En producción, usar variable de entorno

    if (password === ADMIN_PASSWORD) {
      // En producción, establecer una cookie de sesión segura
      document.cookie = 'admin-session=true; path=/; max-age=3600'; // 1 hora
      router.push('/admin');
    } else {
      setError('Contraseña incorrecta');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-8 text-center">
            Admin Access
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-purple-300 text-sm mb-2">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="Ingresa la contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {isLoading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              ← Volver al inicio
            </button>
          </div>

          <div className="mt-8 p-4 bg-black/30 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 text-xs text-center">
              💡 Para desarrollo: usa sirius-admin-2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}