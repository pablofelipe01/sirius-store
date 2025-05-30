"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Purchase {
  id: string;
  wallet_address: string;
  product_name: string;
  product_id: string;
  price: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  purchase_date: string;
  delivery_date?: string;
  notes?: string;
}

interface StatusUpdate {
  purchaseId: string;
  status: string;
  deliveryDate?: string;
  notes?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [updateForm, setUpdateForm] = useState<StatusUpdate>({
    purchaseId: '',
    status: '',
    deliveryDate: '',
    notes: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAllPurchases();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [purchases]);

  const fetchAllPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/purchases?admin=true');
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setMessage({ type: 'error', text: 'Error al cargar las compras' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = purchases.reduce((acc, purchase) => {
      acc.total++;
      acc[purchase.status]++;
      acc.totalRevenue += purchase.price;
      return acc;
    }, {
      total: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    });
    setStats(newStats);
  };

  const handleUpdatePurchase = async () => {
    if (!selectedPurchase) return;

    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/purchases', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseId: selectedPurchase.id,
          status: updateForm.status || selectedPurchase.status,
          deliveryDate: updateForm.deliveryDate,
          notes: updateForm.notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Compra actualizada exitosamente' });
        await fetchAllPurchases();
        setSelectedPurchase(null);
        setUpdateForm({ purchaseId: '', status: '', deliveryDate: '', notes: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la compra' });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => 
    filter === 'all' || purchase.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregado';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            Panel de Administración
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-black/30 backdrop-blur-sm text-blue-300 hover:text-blue-200 px-4 py-2 rounded-lg border border-blue-500/30 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <p className="text-purple-300 text-sm">Total Ventas</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm">Procesando</p>
          <p className="text-2xl font-bold text-white">{stats.processing}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
          <p className="text-green-300 text-sm">Entregados</p>
          <p className="text-2xl font-bold text-white">{stats.delivered}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
          <p className="text-red-300 text-sm">Cancelados</p>
          <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-pink-500/30">
          <p className="text-pink-300 text-sm">Ingresos Totales</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            {stats.totalRevenue.toLocaleString()} Coins
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-black/30 text-purple-300 hover:bg-purple-600/20 border border-purple-500/30'
            }`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-black/30 text-yellow-300 hover:bg-yellow-600/20 border border-yellow-500/30'
            }`}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'processing' 
                ? 'bg-blue-600 text-white' 
                : 'bg-black/30 text-blue-300 hover:bg-blue-600/20 border border-blue-500/30'
            }`}
          >
            Procesando ({stats.processing})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'delivered' 
                ? 'bg-green-600 text-white' 
                : 'bg-black/30 text-green-300 hover:bg-green-600/20 border border-green-500/30'
            }`}
          >
            Entregados ({stats.delivered})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'cancelled' 
                ? 'bg-red-600 text-white' 
                : 'bg-black/30 text-red-300 hover:bg-red-600/20 border border-red-500/30'
            }`}
          >
            Cancelados ({stats.cancelled})
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-300' :
          'bg-green-500/20 border border-green-500/50 text-green-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabla de compras */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-purple-300">Cargando compras...</div>
          ) : filteredPurchases.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay compras en esta categoría</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30 bg-black/30">
                    <th className="text-left p-4 text-purple-300 font-semibold">ID</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Wallet</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Producto</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Precio</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Fecha</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Estado</th>
                    <th className="text-left p-4 text-purple-300 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-purple-500/20 hover:bg-black/20">
                      <td className="p-4 text-gray-400 font-mono text-sm">
                        {purchase.id.slice(0, 8)}...
                      </td>
                      <td className="p-4 text-blue-300 font-mono text-sm">
                        {purchase.wallet_address.slice(0, 6)}...{purchase.wallet_address.slice(-4)}
                      </td>
                      <td className="p-4 text-white">{purchase.product_name}</td>
                      <td className="p-4 text-purple-300 font-semibold">{purchase.price} Coins</td>
                      <td className="p-4 text-gray-300">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(purchase.status)}`}>
                          {getStatusText(purchase.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setUpdateForm({
                              purchaseId: purchase.id,
                              status: purchase.status,
                              deliveryDate: purchase.delivery_date || '',
                              notes: purchase.notes || ''
                            });
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de actualización */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Gestionar Compra</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-purple-300 text-sm">ID de Compra</label>
                <p className="text-gray-400 font-mono text-sm">{selectedPurchase.id}</p>
              </div>
              
              <div>
                <label className="text-purple-300 text-sm">Cliente</label>
                <p className="text-blue-300 font-mono">{selectedPurchase.wallet_address}</p>
              </div>
              
              <div>
                <label className="text-purple-300 text-sm">Producto</label>
                <p className="text-white">{selectedPurchase.product_name}</p>
              </div>
              
              <div>
                <label className="text-purple-300 text-sm block mb-1">Estado</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="text-purple-300 text-sm block mb-1">Fecha de Entrega</label>
                <input
                  type="date"
                  value={updateForm.deliveryDate}
                  onChange={(e) => setUpdateForm({...updateForm, deliveryDate: e.target.value})}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="text-purple-300 text-sm block mb-1">Notas</label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white resize-none"
                  placeholder="Agregar notas sobre la compra..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdatePurchase}
                disabled={isUpdating}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isUpdating
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                }`}
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                onClick={() => {
                  setSelectedPurchase(null);
                  setUpdateForm({ purchaseId: '', status: '', deliveryDate: '', notes: '' });
                }}
                disabled={isUpdating}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}