import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { DocumentData } from '@/lib/schema';

function flattenData(data: DocumentData[]) {
  const rows: any[] = [];

  data.forEach((doc) => {
    // If there are no items, create one row with just the document info
    if (!doc.items || doc.items.length === 0) {
      rows.push({
        company: doc.company,
        address: doc.address,
        total_sum: doc.total_sum,
        item: 'N/A',
        unit_price: 'N/A',
        quantity: 'N/A',
        sum: 'N/A',
      });
    } else {
      // Create a row for each item
      doc.items.forEach((item) => {
        rows.push({
          company: doc.company,
          address: doc.address,
          total_sum: doc.total_sum,
          ...item,
        });
      });
    }
  });

  return rows;
}

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Flatten the nested data structure
    const flatData = flattenData(data);

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(flatData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file as a response
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="extracted_data.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
