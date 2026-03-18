import { useState, useEffect } from 'react';

const BASE_ID = 'app41GZIvyEc1Jnek';
const TABLE_ID = 'tbl7n4d4lilGKHKfy';
const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const TOTAL_PRODUCTS = 2113;

function mapRecord(r) {
  return {
    id: r.id,
    name: r.fields['Product Name'] || '',
    category: r.fields['Main Category'] || 'Other',
    subCategory: r.fields['Sub-Category'] || [],
    plating: r.fields['Plating Options'] || [],
    stones: r.fields['Stone Colors Available'] || [],
    images: r.fields['Product Images'] || [],
    price: r.fields['Wholesale Price USD'] || null,
    notes: r.fields['Notes'] || '',
  };
}

export function useAirtableProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // 0–100
  const [loaded, setLoaded] = useState(0);      // count of records loaded
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        let offset = null;
        const allRecords = [];

        do {
          const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
          url.searchParams.set('pageSize', '100');
          url.searchParams.append('fields[]', 'Product Name');
          url.searchParams.append('fields[]', 'Main Category');
          url.searchParams.append('fields[]', 'Sub-Category');
          url.searchParams.append('fields[]', 'Plating Options');
          url.searchParams.append('fields[]', 'Stone Colors Available');
          url.searchParams.append('fields[]', 'Product Images');
          url.searchParams.append('fields[]', 'Wholesale Price USD');
          url.searchParams.append('fields[]', 'Notes');
          if (offset) url.searchParams.set('offset', offset);

          const res = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });

          if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
          const data = await res.json();
          if (cancelled) return;

          allRecords.push(...data.records.map(mapRecord));
          const pct = Math.min(Math.round((allRecords.length / TOTAL_PRODUCTS) * 100), 99);
          setLoaded(allRecords.length);
          setProgress(pct);

          offset = data.offset || null;
        } while (offset);

        if (!cancelled) {
          setProgress(100);
          // Small pause so user sees 100% before reveal
          setTimeout(() => {
            if (!cancelled) {
              setProducts(allRecords);
              setLoading(false);
            }
          }, 600);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, progress, loaded, error };
}
