import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'papaparse';
import { Tx } from '@/types/transaction';
import { parseFrAmount, parseDate, generateTxKey } from '@/utils/parsers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    
    const parseResult = parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing error',
        details: parseResult.errors 
      }, { status: 400 });
    }

    const rawData = parseResult.data as any[];
    const processedTransactions: Tx[] = [];
    const seenKeys = new Set<string>();
    const processingErrors: any[] = [];

    for (const row of rawData) {
      try {
        // Parse the transaction
        const tx: Tx = {
          dateOp: parseDate(row.dateOp),
          dateVal: parseDate(row.dateVal),
          label: row.label || '',
          category: row.category || '',
          categoryParent: row.categoryParent || 'Non catégorisé',
          supplierFound: row.supplierFound || null,
          amount: parseFrAmount(row.amount),
          comment: row.comment || '',
          accountNum: String(row.accountNum),
          accountLabel: row.accountLabel === 'BoursoBank (joint)' ? 'BoursoBank (joint)' : 'BoursoBank',
          accountbalance: row.accountbalance ? parseFrAmount(row.accountbalance) : undefined,
        };

        // Check for duplicates
        const key = generateTxKey(tx.dateOp, tx.label, tx.amount, tx.accountNum);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          processedTransactions.push(tx);
        }
      } catch (error) {
        console.error('Error processing row:', row, error);
        processingErrors.push({ row, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      transactions: processedTransactions,
      totalProcessed: rawData.length,
      duplicatesSkipped: rawData.length - processedTransactions.length - processingErrors.length,
      processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}