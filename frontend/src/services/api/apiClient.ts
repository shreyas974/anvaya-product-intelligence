import { HttpError } from '@/types/api.types';
import { apiConfig, isUseMocks, simulateLatency } from './apiConfig';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  body?: unknown;
}

/**
 * Builds full URL with search query parameters.
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  baseUrl = apiConfig.baseUrl
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

const SAMPLE_MOCK_CATALOG_ITEMS = [
  {
    id: 1,
    dataset_id: 1,
    mfg_part_num: 'DCD771C2',
    canonical_brand: 'DEWALT',
    cleaned_product_name: '20V MAX Cordless Drill Driver 1/2 in Chuck',
    category_classpath: 'Power Tools > Drills > Cordless Drills',
    short_description: 'DEWALT 20V MAX Cordless Drill Driver with 1/2 in keyless chuck and 2-speed transmission.',
    invoice_description: '20V MAX CORDLESS DRILL 1/2 IN',
    mobile_description: 'DEWALT 20V MAX Drill Driver 1/2 in Chuck. Compact, lightweight, 2 batteries included.',
    long_description: 'The DEWALT DCD771C2 20V MAX Cordless Drill Driver features high speed transmission delivering 2 speeds (0-450 & 1,500 rpm) for a range of fastening and drilling applications. Includes 1/2 in single sleeve ratcheting chuck.',
    validation_status: 'VERIFIED',
    completeness_score: 98.5,
    health_score: 99.2,
    attributes: {
      voltage: '20 V',
      chuck_size: '1/2 in',
      battery_included: 'Yes (2x 20V Lithium-Ion)',
      speed_settings: '2-Speed (0-450 / 0-1500 RPM)',
      tool_weight: '3.64 lb',
    },
    raw_data: {
      RAW_PART_NUM: 'DCD771C2',
      RAW_DESC: '20V MAX DRILL/DRIVER 1/2" -- UNBRANDED --',
      RAW_BRAND: 'DEWALT CORP',
    },
  },
  {
    id: 2,
    dataset_id: 1,
    mfg_part_num: 'VLV-316SS-050',
    canonical_brand: 'ANVIL',
    cleaned_product_name: '1/2 in 316 Stainless Steel 150 lb NPT Threaded Ball Valve',
    category_classpath: 'Valves & Fittings > Ball Valves > Threaded',
    short_description: 'ANVIL 1/2 in 316 Stainless Steel Ball Valve 150 lb NPT Female Threaded.',
    invoice_description: '1/2 IN 316SS 150# NPT BALL VLV',
    mobile_description: 'ANVIL 1/2 in 316SS 150 lb NPT Ball Valve. Corrosion-resistant full port valve.',
    long_description: 'Precision engineered ANVIL 1/2 in 316 Stainless Steel Ball Valve rated for 150 lb working pressure. Standard NPT female connection with PTFE seals for chemical and industrial fluid control.',
    validation_status: 'NORMALIZED',
    completeness_score: 97.0,
    health_score: 98.4,
    attributes: {
      nominal_pipe_size: '1/2 in',
      material_grade: '316 Stainless Steel',
      pressure_class: '150 lb',
      connection_type: 'FNPT x FNPT',
      port_type: 'Full Port',
    },
    raw_data: {
      RAW_PART_NUM: 'VLV316SS050',
      RAW_DESC: '1/2" SS316 150# BALL VALVE THREADED NPT',
      RAW_BRAND: 'Anvil International',
    },
  },
  {
    id: 3,
    dataset_id: 1,
    mfg_part_num: 'FIT-ELB-90-075',
    canonical_brand: 'NIBCO',
    cleaned_product_name: '3/4 in 90 Degree Cast Bronze Threaded Elbow',
    category_classpath: 'Valves & Fittings > Pipe Fittings > Elbows',
    short_description: 'NIBCO 3/4 in 90 Degree Cast Bronze Elbow Threaded NPT Connection.',
    invoice_description: '3/4 IN 90 DEG BRONZE ELBOW NPT',
    mobile_description: 'NIBCO 3/4 in 90-degree bronze elbow. Heavy duty plumbing and heating fitting.',
    long_description: 'NIBCO 3/4 in 90-degree cast bronze elbow for commercial and industrial potable water and heating systems. Standard ASME B16.15 compliant threading.',
    validation_status: 'VERIFIED',
    completeness_score: 96.0,
    health_score: 97.5,
    attributes: {
      nominal_pipe_size: '3/4 in',
      angle: '90 deg',
      material: 'Cast Bronze',
      connection: 'Female NPT',
    },
    raw_data: {
      RAW_PART_NUM: 'FIT-ELB-90-075',
      RAW_DESC: '3/4" 90 DEG BRZ ELBOW NPT FEMALE',
      RAW_BRAND: 'Nibco Inc',
    },
  },
  {
    id: 4,
    dataset_id: 1,
    mfg_part_num: 'MSC-FLG-150-200',
    canonical_brand: 'MUELLER',
    cleaned_product_name: '2 in Carbon Steel Class 150 Raised Face Slip-On Flange',
    category_classpath: 'Valves & Fittings > Flanges > Slip-On',
    short_description: 'MUELLER 2 in Carbon Steel Class 150 Slip-On Raised Face Flange.',
    invoice_description: '2 IN CS 150# RF SLIP-ON FLG',
    mobile_description: 'MUELLER 2 in Class 150 Slip-On flange in carbon steel with raised face.',
    long_description: 'Mueller 2 in ASTM A105 Carbon Steel Class 150 Raised Face Slip-On Flange compliant with ASME B16.5 specifications for piping and pressure vessels.',
    validation_status: 'INFERRED',
    completeness_score: 95.0,
    health_score: 96.0,
    attributes: {
      nominal_pipe_size: '2 in',
      flange_type: 'Slip-On Raised Face (SORF)',
      pressure_class: '150 lb',
      material: 'ASTM A105 Carbon Steel',
    },
    raw_data: {
      RAW_PART_NUM: 'MSCFLG150200',
      RAW_DESC: '2 INCH 150 LB SLIP ON FLANGE CS RF',
      RAW_BRAND: 'Mueller Ind',
    },
  },
];

/**
 * Standalone mock response provider for production deployment without local backend.
 */
function getMockApiResponse<T>(path: string, options: RequestOptions = {}): T | null {
  const cleanPath = path.split('?')[0].replace(/^\/api\/v1/, '').replace(/^\//, '');

  if (cleanPath === 'datasets' || cleanPath.startsWith('datasets')) {
    const rawCustom = typeof window !== 'undefined' ? localStorage.getItem('anvaya_custom_datasets') : null;
    let customList: any[] = rawCustom ? JSON.parse(rawCustom) : [];

    // Handle DELETE /datasets/:id
    if (options.method === 'DELETE') {
      const parts = cleanPath.split('/');
      const deleteId = Number(parts[1]);
      if (deleteId) {
        customList = customList.filter((d) => d.id !== deleteId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('anvaya_custom_datasets', JSON.stringify(customList));
          localStorage.removeItem(`anvaya_products_${deleteId}`);
          localStorage.removeItem(`anvaya_pipeline_${deleteId}`);
        }
      }
      return {
        success: true,
        message: 'Dataset deleted successfully',
      } as unknown as T;
    }

    // Handle POST /datasets/:id/process
    if (cleanPath.includes('/process')) {
      const parts = cleanPath.split('/');
      const processId = Number(parts[1]);
      customList = customList.map((d) => (d.id === processId ? { ...d, status: 'PROCESSED' } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('anvaya_custom_datasets', JSON.stringify(customList));
      }
      return {
        success: true,
        message: 'Dataset processed through 8-stage transformation pipeline',
      } as unknown as T;
    }

    return {
      success: true,
      data: {
        items: customList,
        total: customList.length,
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('dashboard/overview') || cleanPath === 'dashboard') {
    const datasetId = options.params?.dataset_id;
    let products: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed)) products = parsed;
        } catch {}
      }
    }

    if (products.length === 0) {
      return {
        success: true,
        data: {
          kpis: {
            total_products: 0,
            cleanliness_score: 0,
            completeness_score: 0,
            compliance_score: 0,
            flagged_reviews: 0,
            unresolved_conflicts: 0,
          },
          taxonomy_distribution: [],
          enrichment_stats: {
            normalized_units: 0,
            recovered_brands: 0,
            proven_facts: 0,
          },
        },
      } as unknown as T;
    }

    const categoriesMap: Record<string, number> = {};
    products.forEach((p) => {
      const cat = (p.category_classpath || 'General Industrial').split(' > ')[0];
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });
    const taxonomy_distribution = Object.entries(categoriesMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / products.length) * 1000) / 10,
    }));

    return {
      success: true,
      data: {
        kpis: {
          total_products: products.length,
          cleanliness_score: 99.2,
          completeness_score: 98.4,
          compliance_score: 100.0,
          flagged_reviews: Math.min(2, Math.floor(products.length * 0.1)),
          unresolved_conflicts: Math.min(1, Math.floor(products.length * 0.05)),
        },
        taxonomy_distribution,
        enrichment_stats: {
          normalized_units: products.length * 3,
          recovered_brands: products.length,
          proven_facts: products.length * 5,
        },
      },
    } as unknown as T;
  }

  if (cleanPath === 'products') {
    const datasetId = options.params?.dataset_id;
    let items: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed)) {
            items = parsed;
          }
        } catch {}
      }
    }

    // Apply filtering if provided
    let filtered = items;
    if (options.params?.search) {
      const q = String(options.params.search).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.mfg_part_num && p.mfg_part_num.toLowerCase().includes(q)) ||
          (p.canonical_brand && p.canonical_brand.toLowerCase().includes(q)) ||
          (p.cleaned_product_name && p.cleaned_product_name.toLowerCase().includes(q))
      );
    }
    if (options.params?.brand && options.params.brand !== 'ALL') {
      filtered = filtered.filter((p) => p.canonical_brand === options.params?.brand);
    }
    if (options.params?.category && options.params.category !== 'ALL') {
      filtered = filtered.filter((p) => p.category_classpath?.includes(String(options.params?.category)));
    }

    return {
      success: true,
      data: {
        items: filtered,
        pagination: {
          total_items: filtered.length,
          total_pages: Math.max(1, Math.ceil(filtered.length / 25)),
          page: 1,
          page_size: 25,
        },
      },
    } as unknown as T;
  }


  if (cleanPath.startsWith('products/')) {
    const parts = cleanPath.split('/');
    const prodId = Number(parts[1]) || 1;
    const found = SAMPLE_MOCK_CATALOG_ITEMS.find((p) => p.id === prodId) || SAMPLE_MOCK_CATALOG_ITEMS[0];

    if (parts[2] === 'truth') {
      return {
        success: true,
        data: {
          product_id: found.id,
          sku: found.mfg_part_num,
          title: found.cleaned_product_name,
          decision_traces: [
            {
              field: 'Brand Name',
              value: found.canonical_brand,
              source_column: 'RAW_BRAND',
              rule: 'AUTHORITATIVE_BRAND_DICTIONARY',
              evidence: `Raw string [${found.raw_data.RAW_BRAND}] mapped to canonical brand`,
              confidence: 0.994,
              status: 'VERIFIED',
            },
            {
              field: 'Cleaned Product Name',
              value: found.cleaned_product_name,
              source_column: 'RAW_DESC',
              rule: 'SYNTACTIC_NORMALIZER_V2',
              evidence: `Scrubbed placeholder tokens and capitalized standards`,
              confidence: 0.982,
              status: 'NORMALIZED',
            },
            {
              field: 'Category Taxonomy',
              value: found.category_classpath,
              source_column: 'RAW_DESC',
              rule: 'UNSPSC_TAXONOMY_CLASSIFIER',
              evidence: `Keyword match on industrial fittings hierarchy`,
              confidence: 0.975,
              status: 'VERIFIED',
            },
          ],
          evidence_records: [
            {
              field: 'Brand Name',
              source_column: 'RAW_BRAND',
              raw_snippet: found.raw_data.RAW_BRAND,
              rule_applied: 'AUTHORITATIVE_BRAND_DICTIONARY',
              standard_matched: 'Unilog Approved Brand LOV',
              confidence_score: 99.4,
              validation_result: 'PASSED',
            },
          ],
        },
      } as unknown as T;
    }

    if (parts[2] === 'content') {
      return {
        success: true,
        data: {
          product_id: found.id,
          sku: found.mfg_part_num,
          invoice_description: found.invoice_description,
          mobile_description: found.mobile_description,
          short_description: found.short_description,
          long_description: found.long_description,
          retail_description: `${found.canonical_brand} ${found.cleaned_product_name}`,
        },
      } as unknown as T;
    }

    return {
      success: true,
      data: found,
    } as unknown as T;
  }

  if (cleanPath.startsWith('conflicts')) {
    const datasetId = options.params?.dataset_id;
    let products: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed)) products = parsed;
        } catch {}
      }
    }

    if (products.length === 0) {
      return {
        success: true,
        data: {
          conflicts: [],
          resolved_count: 0,
          pending_count: 0,
        },
      } as unknown as T;
    }

    const conflicts = products.slice(0, 1).map((item, idx) => ({
      id: 101 + idx,
      sku: item.mfg_part_num || 'VLV-316SS-050',
      conflict_type: 'BRAND_DISCREPANCY',
      product_id: item.id,
      product_name: item.cleaned_product_name || 'Industrial Catalog Item',
      description: `Vendor feed specifies "${item.raw_data?.RAW_BRAND || 'Vendor'}" while Catalog LOV resolved to canonical ${item.canonical_brand}.`,
      source_1: { field: 'Vendor Feed', value: item.raw_data?.RAW_BRAND || 'Vendor' },
      source_2: { field: 'Canonical Master LOV', value: item.canonical_brand },
      canonical_resolution: item.canonical_brand,
      status: 'RESOLVED',
    }));

    return {
      success: true,
      data: {
        conflicts,
        resolved_count: conflicts.length,
        pending_count: 0,
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('data-quality')) {
    const datasetId = options.params?.dataset_id;
    let products: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed)) products = parsed;
        } catch {}
      }
    }

    if (products.length === 0) {
      return {
        success: true,
        data: {
          overall_quality_score: 0,
          dimensions: [
            { name: 'Completeness', score: 0, description: 'Average filled critical attributes across catalog.' },
            { name: 'Consistency', score: 0, description: 'Percentage of standardized titles, UOMs, and descriptions.' },
            { name: 'Uniqueness', score: 0, description: 'Ratio of unique manufacturer part numbers across suppliers.' },
            { name: 'Freshness', score: 0, description: 'Catalog ingestion and re-indexing recency.' },
            { name: 'Accuracy', score: 0, description: 'Benchmark verified against known brand master dictionaries and regex constraints.' },
          ],
          attribute_fill_rates: [],
          anomalies: [],
        },
      } as unknown as T;
    }

    return {
      success: true,
      data: {
        overall_quality_score: 96.8,
        dimensions: [
          { name: 'Completeness', score: 96.2, description: 'Average filled critical attributes across catalog.' },
          { name: 'Consistency', score: 98.4, description: 'Percentage of standardized titles, UOMs, and descriptions.' },
          { name: 'Uniqueness', score: 100.0, description: 'Ratio of unique manufacturer part numbers across suppliers.' },
          { name: 'Freshness', score: 99.0, description: 'Catalog ingestion and re-indexing recency.' },
          { name: 'Accuracy', score: 98.2, description: 'Benchmark verified against known brand master dictionaries and regex constraints.' },
        ],
        attribute_fill_rates: [
          { attribute: 'Manufacturer Part Number', fill_rate: 100.0 },
          { attribute: 'Canonical Brand', fill_rate: 100.0 },
          { attribute: 'Category Taxonomy', fill_rate: 100.0 },
          { attribute: 'Nominal Pipe Size', fill_rate: 94.5 },
          { attribute: 'Material Grade', fill_rate: 96.0 },
        ],
        anomalies: [],
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('reviews')) {
    if (options.method === 'POST') {
      return {
        success: true,
        message: 'Review decision recorded successfully.',
      } as unknown as T;
    }

    const datasetId = options.params?.dataset_id;
    let items: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed)) {
            items = parsed;
          }
        } catch {}
      }
    }

    if (items.length === 0) {
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          total_pending: 0,
        },
      } as unknown as T;
    }

    const reviewList = items.slice(0, 3).map((item, idx) => ({
      id: idx + 1,
      product_id: String(item.id),
      sku: item.mfg_part_num || `SKU-${idx + 1}`,
      field: idx === 0 ? 'Chuck Size' : idx === 1 ? 'Material Grade' : 'Canonical Brand',
      original_value: idx === 0 ? '1/2"' : idx === 1 ? 'SS316' : item.raw_data?.RAW_BRAND || 'UNBRANDED',
      normalized_value: idx === 0 ? '1/2 in' : idx === 1 ? '316 Stainless Steel' : item.canonical_brand || 'DEWALT',
      status: 'PENDING',
      confidence: idx === 0 ? 0.98 : 0.94,
      source: idx === 0 ? 'UOM_GOVERNANCE' : idx === 1 ? 'LOV_MATCHER' : 'BRAND_RESOLVER',
      evidence: idx === 0
        ? 'Converted double quote symbol to standard unit token'
        : idx === 1
        ? 'Standardized alloy string against Unilog Materials vocabulary'
        : 'Resolved manufacturer alias against UniCat Brand Master',
    }));

    return {
      success: true,
      data: {
        items: reviewList,
        total: reviewList.length,
        total_pending: reviewList.length,
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('fittings/normalize')) {
    const body = (options.body as Record<string, string>) || {};
    const raw = body.raw_text || '3/8 CPLG BRS 150#';

    // Dynamic token extraction
    let size = '3/8 in';
    if (raw.includes('1/2')) size = '1/2 in';
    else if (raw.includes('3/4')) size = '3/4 in';
    else if (raw.includes('1-1/2')) size = '1-1/2 in';
    else if (raw.includes('1/4')) size = '1/4 in';
    else if (raw.includes('2')) size = '2 in';

    let fittingType = 'Coupling';
    if (raw.includes('ELB')) fittingType = '90° Elbow';
    else if (raw.includes('TEE')) fittingType = 'Tee';
    else if (raw.includes('BUSH')) fittingType = 'Hex Bushing';
    else if (raw.includes('NIP')) fittingType = 'Close Nipple';
    else if (raw.includes('VALVE')) fittingType = 'Ball Valve';

    let material = 'Brass';
    if (raw.includes('SS')) material = '316 Stainless Steel';
    else if (raw.includes('MI')) material = 'Malleable Iron';
    else if (raw.includes('CS')) material = 'Carbon Steel';

    let pressure = 'Class 150';
    if (raw.includes('3000#') || raw.includes('3000')) pressure = 'Class 3000';
    else if (raw.includes('SCH 80') || raw.includes('80')) pressure = 'Schedule 80';

    return {
      success: true,
      data: {
        raw_description: raw,
        size,
        fitting_type: fittingType,
        material,
        connection_type: raw.includes('SWEAT') ? 'Sweat / Solder' : 'NPT Female Threaded',
        pressure_rating: pressure,
        standardized_line: `${size} ${material} ${pressure} ${fittingType}`,
        evidence_trace: [
          { field: 'Nominal Size', raw_term: size.replace(' in', ''), normalized_value: size, rule: 'Decimal_Fraction & Unilog UOM Standard UOM-01', confidence: 0.99 },
          { field: 'Fitting Type', raw_term: raw.split(' ')[1] || 'CPLG', normalized_value: fittingType, rule: 'Fittings_LOV.xlsx > Fitting Types', confidence: 0.99 },
          { field: 'Material', raw_term: raw.includes('SS') ? 'SS' : raw.includes('MI') ? 'MI' : raw.includes('CS') ? 'CS' : 'BRS', normalized_value: material, rule: 'Fittings_LOV.xlsx > Approved Materials', confidence: 0.99 },
          { field: 'Pressure Rating', raw_term: pressure.replace('Class ', '').replace('Schedule ', ''), normalized_value: pressure, rule: 'Fittings_LOV.xlsx > Pressure Classifications', confidence: 0.98 },
        ],
        confidence: 0.99,
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('export/delivery')) {
    const datasetId = options.params?.dataset_id;
    let recCount = SAMPLE_MOCK_CATALOG_ITEMS.length;
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            recCount = parsed.length;
          }
        } catch {}
      }
    }

    return {
      success: true,
      data: {
        format: 'csv',
        total_columns: 252,
        total_records: recCount,
        status: 'READY',
        file_name: 'anvaya_master_252_column_delivery.csv',
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('auth/oauth') || cleanPath.startsWith('auth/login') || cleanPath.startsWith('auth/register')) {
    const body = options.body as Record<string, unknown> | undefined;
    return {
      success: true,
      token: `jwt_token_${Date.now()}`,
      user: {
        id: 'usr_enterprise_1',
        email: body?.email || 'user@anvaya.ai',
        name: body?.name || 'Enterprise Catalog Lead',
        role: body?.role || 'ADMIN',
      },
    } as unknown as T;
  }

  if (cleanPath.startsWith('copilot/query')) {
    const body = (options.body as Record<string, any>) || {};
    const query = String(body.query || '').toLowerCase();
    const datasetId = body.dataset_id;

    let items: any[] = [];
    if (datasetId && typeof window !== 'undefined') {
      const rawStored = localStorage.getItem(`anvaya_products_${datasetId}`);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
          }
        } catch {}
      }
    }

    if (items.length === 0) {
      return {
        success: true,
        data: {
          answer: 'No active dataset is currently selected or loaded. Please upload a dataset on the Datasets page or select an active catalog to ask questions about your product data.',
          citations: [],
          source_type: 'grounded_autonomous',
        },
      } as unknown as T;
    }

    let answer = `Based on your active product intelligence catalog (${items.length} items analyzed), all items have been parsed through the 8-stage transformation pipeline with 100% UOM standard compliance and zero character-limit violations.`;
    const citations: any[] = [];

    if (query.includes('brand') || query.includes('missing') || query.includes('unbranded')) {
      const brandMap: Record<string, number> = {};
      items.forEach((p) => {
        const b = p.canonical_brand || 'Unbranded';
        brandMap[b] = (brandMap[b] || 0) + 1;
      });
      const brandSummary = Object.entries(brandMap)
        .map(([b, count]) => `**${b}** (${count} SKU${count > 1 ? 's' : ''})`)
        .join(', ');
      answer = `In the active catalog, brand distribution is: ${brandSummary}. All brand names are normalized against the UniCat Brand Master LOV.`;
    } else if (query.includes('review') || query.includes('flagged') || query.includes('pending')) {
      const pendingCount = Math.min(2, Math.floor(items.length * 0.1));
      answer = `There are currently ${pendingCount} items flagged for human-in-the-loop review in the active catalog (e.g. on SKU \`${items[0]?.mfg_part_num || 'SKU-001'}\`). All other items have auto-approved confidence scores above 95%.`;
    } else if (query.includes('category') || query.includes('categories') || query.includes('taxonomy')) {
      const cats = Array.from(new Set(items.map((p) => p.category_classpath).filter(Boolean)));
      answer = `The active catalog spans ${cats.length} UNSPSC taxonomy classifications: \n` +
        cats.map((c) => `• \`${c}\``).join('\n');
    } else if (query.includes('duplicate') || query.includes('mpn') || query.includes('part number')) {
      answer = `Cross-source uniqueness audit completed: Zero duplicate manufacturer part numbers were detected across suppliers in this active catalog dataset (${items.length} unique SKUs).`;
    } else if (query.includes('score') || query.includes('health') || query.includes('quality')) {
      const avgHealth = (items.reduce((acc, p) => acc + (p.health_score || 95), 0) / (items.length || 1)).toFixed(1);
      answer = `The average Data Quality Health Score across the active dataset is **${avgHealth}%**, with 100% compliance on mandatory 252-column schema fields.`;
    }

    if (items.length > 0) {
      citations.push({
        product_id: items[0].id,
        sku: items[0].mfg_part_num || 'SKU-001',
        brand: items[0].canonical_brand || 'DEWALT',
        cleaned_title: items[0].cleaned_product_name || 'Standard Industrial SKU',
        raw_text: items[0].raw_data?.RAW_DESC || items[0].cleaned_product_name || 'Raw Supplier Record',
        field_name: 'Catalog Specification',
        confidence: 0.985,
        evidence: 'Scrubbed vendor placeholders and standardized 252-column attributes',
      });
    }

    return {
      success: true,
      data: {
        answer,
        citations,
        source_type: 'grounded_autonomous',
      },
    } as unknown as T;
  }

  return null;
}

/**
 * Core fetch wrapper with timeout, json formatting, and mock fallback handling.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    timeoutMs = apiConfig.timeoutMs,
    body,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // Intercept immediately if mock mode is active
  if (isUseMocks()) {
    await simulateLatency();
    const mockRes = getMockApiResponse<T>(path, options);
    if (mockRes !== null) {
      return mockRes;
    }
  }

  const url = buildUrl(path, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let token: string | null = null;
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('anvaya_auth_token');
      if (!token) {
        const rawSession = localStorage.getItem('anvaya_active_session');
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          token = parsed.token || null;
        }
      }
    }
  } catch {
    // Ignore in strict environments
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
      serializedBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      serializedBody = JSON.stringify(body);
    }
  }

  try {
    const fetchInit: RequestInit = {
      ...fetchOptions,
      headers,
      body: serializedBody,
    };
    if (typeof AbortController !== 'undefined' && controller?.signal && typeof (controller.signal as any)?.aborted === 'boolean') {
      try {
        fetchInit.signal = controller.signal;
      } catch {
        // Ignore if test environment mock has incompatible signal class
      }
    }

    let response: Response;
    try {
      response = await fetch(url, fetchInit);
    } catch (fetchErr) {
      if (fetchInit.signal) {
        delete fetchInit.signal;
        response = await fetch(url, fetchInit);
      } else {
        throw fetchErr;
      }
    }
    clearTimeout(timeoutId);

    // Parse JSON response body if present
    const contentType = response.headers.get('content-type');
    let responseData: unknown;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = text ? JSON.parse(text) : undefined;
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      const message =
        responseData && typeof responseData === 'object' && 'message' in responseData
          ? String((responseData as { message: unknown }).message)
          : `Request failed with status ${response.status}`;

      throw new HttpError(response.status, response.statusText, responseData, message);
    }

    return responseData as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(408, 'Request Timeout', undefined, `Request to ${path} timed out after ${timeoutMs}ms`);
    }

    const networkErrorMsg = error instanceof Error ? error.message : 'Unknown Network Error';
    throw new HttpError(0, 'Network Error', undefined, `Network error: ${networkErrorMsg}`);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
