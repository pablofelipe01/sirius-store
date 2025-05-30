"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { polygon } from "@/app/chain";
import { useSiriusPoints } from "@/hooks/useSiriusPoints";

export default function Home() {
  const account = useActiveAccount();
  
  // Hook para puntos Sirius desde Airtable
  const { 
    points, 
    userData, 
    isLoading: isLoadingPoints, 
    error: pointsError, 
    userExists, 
    createUser 
  } = useSiriusPoints(account?.address);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/logo.png"
            alt="Sirius Logo"
            width={200}
            height={60}
            className="h-16 w-auto md:h-20"
            priority
          />
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
          SIRIUS VERSE
        </h1>

        {/* Botón de conexión */}
        <div className="glow-container relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-75 blur-xl"></div>
          <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
            <ConnectButton
              client={client}
              chain={polygon}
              connectModal={{
                size: "compact",
                title: "Sirius Verse",
                welcomeScreen: {
                  title: "Bienvenido a Sirius Verse",
                  subtitle: "Conecta tu wallet para continuar",
                },
              }}
            />
          </div>
        </div>

        {/* Puntos Sirius - Solo visible si está conectado */}
        {account && (
          <>
            <div className="glow-container relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60 blur-lg"></div>
              <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${userExists ? 'bg-purple-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className={`text-sm font-medium ${userExists ? 'text-purple-300' : 'text-red-300'}`}>
                      {userExists ? 'Usuario Registrado' : 'Usuario No Registrado'}
                    </span>
                  </div>
                  <div className="text-white">
                    <p className="text-lg text-purple-200 mb-1">Sirius Coin</p>
                    {isLoadingPoints ? (
                      <p className="text-2xl font-bold text-purple-300">Cargando...</p>
                    ) : userExists ? (
                      <>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                          {points.toLocaleString()} Coins
                        </p>
                        {userData && (
                          <p className="text-sm text-purple-200 mt-2">
                            Bienvenido, {userData.name}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xl font-bold text-red-300">
                          0 Puntos
                        </p>
                        <button
                          onClick={() => createUser()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          Registrarse en Sirius
                        </button>
                      </div>
                    )}
                  </div>
                  {pointsError && (
                    <p className="text-red-300 text-sm mt-2">{pointsError}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botón para ir a la tienda */}
            {userExists && (
              <div className="mt-8">
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ir a la Tienda
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}