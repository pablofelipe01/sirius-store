// src/app/api/user-points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Configurar Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Buscar el usuario en Airtable por dirección de wallet
    const records = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{wallet_address} = "${walletAddress}"`,
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      return NextResponse.json(
        { 
          exists: false, 
          message: 'Usuario no encontrado en la base de datos',
          points: 0 
        },
        { status: 404 }
      );
    }

    const userRecord = records[0];
    const userData = {
      id: userRecord.id,
      wallet_address: userRecord.get('wallet_address'),
      points: userRecord.get('sirius_points') || 0,
      name: userRecord.get('name') || 'Usuario',
      created_at: userRecord.get('created_at'),
      last_updated: userRecord.get('last_updated')
    };

    return NextResponse.json({
      exists: true,
      user: userData,
      points: userData.points
    });

  } catch (error) {
    console.error('Error fetching user from Airtable:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingRecords = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{wallet_address} = "${walletAddress}"`,
        maxRecords: 1
      })
      .firstPage();

    if (existingRecords.length > 0) {
      return NextResponse.json(
        { 
          exists: true, 
          message: 'Usuario ya existe',
          user: existingRecords[0].fields 
        }
      );
    }

    // Crear nuevo usuario
    const newRecord = await base(process.env.AIRTABLE_TABLE_NAME!).create([
      {
        fields: {
          wallet_address: walletAddress,
          name: name || 'Usuario',
          // NO incluir sirius_points porque es un campo calculado
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newRecord[0].fields
    });

  } catch (error) {
    console.error('Error creating user in Airtable:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}