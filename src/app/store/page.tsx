"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import { useSiriusPoints } from "@/hooks/useSiriusPoints";
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

const products: Product[] = [
  {
    id: "prod1",
    name: "Taza Sirius Premium",
    description: "Taza de cerámica premium con el logo oficial de Sirius. Capacidad 350ml, apta para microondas y lavavajillas",
    price: 500,
    image: "/producto1.png",
    stock: 10
  },
  {
    id: "prod2",
    name: "Tote Bag Sirius",
    description: "Bolsa de algodón orgánico 100% con diseño exclusivo Sirius. Dimensiones 38x42cm, asas reforzadas",
    price: 1000,
    image: "/producto2.png",
    stock: 25
  },
  {
    id: "prod3",
    name: "Cuaderno Sirius A5",
    description: "Libreta premium A5 con espiral, 120 páginas de papel de alta calidad, tapa dura con logo Sirius",
    price: 300,
    image: "/producto3.png",
    stock: 50
  },
  {
    id: "prod4",
    name: "Hoodie Sirius Limited",
    description: "Sudadera con capucha edición limitada, algodón premium 100%, diseño bordado del logo Sirius",
    price: 2000,
    image: "/producto4.png",
    stock: 5
  }
];

export default function StorePage() {
  const account = useActiveAccount();
  const router = useRouter();
  const { points, isLoading: isLoadingPoints, refetch } = useSiriusPoints(account?.address);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (account?.address) {
      fetchUserPurchases();
    }
  }, [account?.address]);

  const fetchUserPurchases = async () => {
    if (!account?.address) return;
    
    try {
      const response = await fetch(`/api/purchases?wallet=${account.address}`);
      const data = await response.json();
      setUserPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!account?.address) {
      setMessage({ type: 'error', text: 'Por favor conecta tu wallet primero' });
      return;
    }

    if (points < product.price) {
      setMessage({ type: 'error', text: 'No tienes suficientes Sirius Coins' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
          productId: product.id,
          productName: product.name,
          price: product.price
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Compra realizada exitosamente!' });
        await refetch(); // Actualizar el balance
        await fetchUserPurchases(); // Actualizar las compras
        setSelectedProduct(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al procesar la compra' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al procesar la compra' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-2"
          >
            ← Volver al inicio
          </button>
          
          {account && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/30">
              <p className="text-purple-300 text-sm">Balance:</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                {isLoadingPoints ? '...' : points.toLocaleString()} Coins
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Título */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-4">
          Sirius Store
        </h1>
        <p className="text-blue-200 text-lg">
          Intercambia tus Sirius Coins por productos exclusivos
        </p>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-300' :
          'bg-green-500/20 border border-green-500/50 text-green-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Productos */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-50 group-hover:opacity-75 blur transition duration-300"></div>
            <div className="relative bg-black/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/30">
              {/* Imagen del producto */}
              <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.stock <= 5 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    ¡Últimas {product.stock} unidades!
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-blue-200 text-sm mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-purple-300 text-sm">Precio</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      {product.price} Coins
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-300 text-sm">Stock</p>
                    <p className="text-lg font-semibold text-white">{product.stock}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(product)}
                  disabled={!account || product.stock === 0}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    !account || product.stock === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
                  }`}
                >
                  {!account ? 'Conecta tu wallet' : 
                   product.stock === 0 ? 'Agotado' : 'Comprar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Confirmar Compra</h2>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">{selectedProduct.name}</h3>
              <p className="text-blue-200 text-sm mb-3">{selectedProduct.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Precio:</span>
                <span className="text-xl font-bold text-purple-300">{selectedProduct.price} Coins</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Tu balance:</span>
                <span className={`text-lg font-semibold ${points >= selectedProduct.price ? 'text-green-400' : 'text-red-400'}`}>
                  {points} Coins
                </span>
              </div>
              <div className="border-t border-gray-700 mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Balance después:</span>
                  <span className="text-lg font-semibold text-blue-300">
                    {points - selectedProduct.price} Coins
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePurchase(selectedProduct)}
                disabled={isProcessing || points < selectedProduct.price}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isProcessing || points < selectedProduct.price
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                disabled={isProcessing}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de compras del usuario */}
      {account && userPurchases.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-6">
            Mis Compras
          </h2>
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left p-4 text-purple-300">Producto</th>
                    <th className="text-left p-4 text-purple-300">Precio</th>
                    <th className="text-left p-4 text-purple-300">Fecha</th>
                    <th className="text-left p-4 text-purple-300">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {userPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-purple-500/20">
                      <td className="p-4 text-white">{purchase.product_name}</td>
                      <td className="p-4 text-blue-200">{purchase.price} Coins</td>
                      <td className="p-4 text-gray-300">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          purchase.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                          purchase.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {purchase.status === 'delivered' ? 'Entregado' :
                           purchase.status === 'processing' ? 'Procesando' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}