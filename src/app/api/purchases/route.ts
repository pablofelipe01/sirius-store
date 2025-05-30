// src/app/api/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

// GET - Obtener todas las compras o las de un usuario específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const isAdmin = searchParams.get('admin') === 'true';

    let filterFormula = '';
    
    if (!isAdmin && walletAddress) {
      filterFormula = `{wallet_address} = "${walletAddress}"`;
    }

    const records = await base(process.env.AIRTABLE_PURCHASES_TABLE_NAME!)
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'purchase_date', direction: 'desc' }]
      })
      .all();

    const purchases = records.map(record => ({
      id: record.id,
      wallet_address: record.get('wallet_address'),
      product_name: record.get('product_name'),
      product_id: record.get('product_id'),
      price: record.get('price'),
      status: record.get('status') || 'pending',
      purchase_date: record.get('purchase_date'),
      delivery_date: record.get('delivery_date'),
      notes: record.get('notes')
    }));

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Error al obtener las compras' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, productId, productName, price } = body;

    if (!walletAddress || !productId || !productName || !price) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga suficientes coins
    const userRecords = await base(process.env.AIRTABLE_TABLE_NAME!)
      .select({
        filterByFormula: `{wallet_address} = "${walletAddress}"`,
        maxRecords: 1
      })
      .firstPage();

    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userRecord = userRecords[0];
    const currentPoints = userRecord.get('sirius_points') || 0;

    if (currentPoints < price) {
      return NextResponse.json(
        { error: 'Saldo insuficiente de Sirius Coins' },
        { status: 400 }
      );
    }

    // Crear el registro de compra
    const purchaseRecord = await base(process.env.AIRTABLE_PURCHASES_TABLE_NAME!).create([
      {
        fields: {
          wallet_address: walletAddress,
          product_id: productId,
          product_name: productName,
          price: price,
          status: 'pending',
          purchase_date: new Date().toISOString()
        }
      }
    ]);

    // Crear transacción (esto actualizará el balance automáticamente)
    if (process.env.AIRTABLE_TRANSACTIONS_TABLE_NAME) {
      try {
        await base(process.env.AIRTABLE_TRANSACTIONS_TABLE_NAME).create([
          {
            fields: {
              wallet_address: walletAddress,
              amount: -price, // Negativo porque es un débito
              type: 'purchase',
              description: `Compra: ${productName}`,
              related_purchase_id: purchaseRecord[0].id,
              transaction_date: new Date().toISOString()
            }
          }
        ]);
      } catch (txError) {
        console.log('Error creando transacción:', txError);
        // Si falla la transacción, eliminar la compra
        await base(process.env.AIRTABLE_PURCHASES_TABLE_NAME!).destroy([purchaseRecord[0].id]);
        throw txError;
      }
    }

    // NO actualizamos sirius_points porque es calculado
    // Solo actualizamos last_updated
    try {
      await base(process.env.AIRTABLE_TABLE_NAME!).update([
        {
          id: userRecord.id,
          fields: {
            last_updated: new Date().toISOString()
          }
        }
      ]);
    } catch (updateError) {
      console.log('No se pudo actualizar last_updated:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Compra realizada exitosamente',
      purchase: purchaseRecord[0].fields,
      newBalance: currentPoints - price
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Error al procesar la compra' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado de una compra (para admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId, status, deliveryDate, notes } = body;

    if (!purchaseId || !status) {
      return NextResponse.json(
        { error: 'ID de compra y estado son requeridos' },
        { status: 400 }
      );
    }

    const updateFields: any = { status };
    if (deliveryDate) updateFields.delivery_date = deliveryDate;
    if (notes) updateFields.notes = notes;

    const updatedRecord = await base(process.env.AIRTABLE_PURCHASES_TABLE_NAME!).update([
      {
        id: purchaseId,
        fields: updateFields
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Compra actualizada exitosamente',
      purchase: updatedRecord[0].fields
    });

  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la compra' },
      { status: 500 }
    );
  }
}