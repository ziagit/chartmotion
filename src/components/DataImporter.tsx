import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileJson, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store';
import { ColumnInfo, DataRow } from '../types';

interface DataImporterProps {}

export default function DataImporter({}: DataImporterProps) {
  const { setData, columns } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const processFile = (file: File) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
      try {
        const dataResult = e.target?.result;
        if (!dataResult) return;

        let parsedRows: DataRow[] = [];
        let detectedColumns: ColumnInfo[] = [];

        if (extension === 'json') {
          const json = JSON.parse(dataResult as string);
          if (Array.isArray(json)) {
            parsedRows = json;
          } else if (json.data && Array.isArray(json.data)) {
            parsedRows = json.data;
          } else {
            alert('JSON must be an array of objects or contain an array named "data".');
            return;
          }
        } else {
          // Parse CSV or XLSX
          const workbook = XLSX.read(dataResult, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedRows = XLSX.utils.sheet_to_json<DataRow>(worksheet, { defval: '' });
        }

        if (parsedRows.length === 0) {
          alert('No data rows found in the file.');
          return;
        }

        // Get all unique keys as columns
        const keysMap: Record<string, boolean> = {};
        parsedRows.forEach((row) => {
          Object.keys(row).forEach((key) => {
            keysMap[key] = true;
          });
        });
        const allKeys = Object.keys(keysMap);

        // Auto detect column type based on first 15 row samples
        detectedColumns = allKeys.map((colName) => {
          let numCount = 0;
          let dateCount = 0;
          let filledCount = 0;

          const testLimit = Math.min(parsedRows.length, 15);
          for (let i = 0; i < testLimit; i++) {
            const val = parsedRows[i][colName];
            if (val !== undefined && val !== null && val !== '') {
              filledCount++;
              const strVal = String(val).trim();
              
              // Numeric test
              if (!isNaN(Number(strVal)) && strVal !== '') {
                numCount++;
              }
              // Date test
              const parsedDate = Date.parse(strVal);
              if (!isNaN(parsedDate) && isNaN(Number(strVal)) && strVal.length > 5) {
                dateCount++;
              }
            }
          }

          let type: 'numeric' | 'category' | 'date' = 'category';
          if (filledCount > 0) {
            if (numCount / filledCount > 0.7) {
              type = 'numeric';
            } else if (dateCount / filledCount > 0.7) {
              type = 'date';
            }
          }
          return { name: colName, type };
        });

        // Convert parsed row values dynamically
        const cleanedRows = parsedRows.map((row) => {
          const cleanedRow: DataRow = {};
          detectedColumns.forEach((col) => {
            const origVal = row[col.name];
            if (col.type === 'numeric') {
              const numVal = parseFloat(String(origVal));
              cleanedRow[col.name] = isNaN(numVal) ? 0 : numVal;
            } else {
              cleanedRow[col.name] = origVal === undefined ? '' : origVal;
            }
          });
          return cleanedRow;
        });

        setData(cleanedRows, detectedColumns);
        setSuccessMsg(`Successfully imported ${cleanedRows.length} rows and ${detectedColumns.length} columns from "${file.name}"!`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };

    if (extension === 'json') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Premade templates to instantly swap datasets for dynamic rendering
  const loadPresetData = (presetName: string) => {
    let presetRows: DataRow[] = [];
    let presetCols: ColumnInfo[] = [];

    if (presetName === 'crypto') {
      presetRows = [
        { Quarter: '2023 Q1', Bitcoin: 28000, Ethereum: 1800, Solana: 20 },
        { Quarter: '2023 Q2', Bitcoin: 30400, Ethereum: 1950, Solana: 18 },
        { Quarter: '2023 Q3', Bitcoin: 27000, Ethereum: 1650, Solana: 21 },
        { Quarter: '2023 Q4', Bitcoin: 42000, Ethereum: 2300, Solana: 75 },
        { Quarter: '2024 Q1', Bitcoin: 71000, Ethereum: 3600, Solana: 180 },
        { Quarter: '2024 Q2', Bitcoin: 62000, Ethereum: 3100, Solana: 140 },
        { Quarter: '2024 Q3', Bitcoin: 65000, Ethereum: 2600, Solana: 155 },
        { Quarter: '2024 Q4', Bitcoin: 96000, Ethereum: 3900, Solana: 240 },
      ];
      presetCols = [
        { name: 'Quarter', type: 'category' },
        { name: 'Bitcoin', type: 'numeric' },
        { name: 'Ethereum', type: 'numeric' },
        { name: 'Solana', type: 'numeric' },
      ];
    } else if (presetName === 'ev') {
      presetRows = [
        { Brand: 'Tesla', Sales: 1808000, MarketShare: 19.1 },
        { Brand: 'BYD', Sales: 1574000, MarketShare: 16.5 },
        { Brand: 'GAC Aion', Sales: 480000, MarketShare: 5.1 },
        { Brand: 'SAIC-GM-Wuling', Sales: 423000, MarketShare: 4.5 },
        { Brand: 'Volkswagen', Sales: 394000, MarketShare: 4.1 },
        { Brand: 'Geely', Sales: 350000, MarketShare: 3.7 },
        { Brand: 'Others', Sales: 4400000, MarketShare: 47.1 },
      ];
      presetCols = [
        { name: 'Brand', type: 'category' },
        { name: 'Sales', type: 'numeric' },
        { name: 'MarketShare', type: 'numeric' },
      ];
    } else {
      // Default: Google search
      presetRows = [
        { Year: '2006', 'Google Search Users (Billions)': 0.63, 'Growth %': 0 },
        { Year: '2007', 'Google Search Users (Billions)': 0.78, 'Growth %': 23.8 },
        { Year: '2008', 'Google Search Users (Billions)': 1.01, 'Growth %': 29.5 },
        { Year: '2009', 'Google Search Users (Billions)': 1.25, 'Growth %': 23.8 },
        { Year: '2010', 'Google Search Users (Billions)': 1.46, 'Growth %': 16.8 },
        { Year: '2011', 'Google Search Users (Billions)': 1.67, 'Growth %': 14.4 },
        { Year: '2012', 'Google Search Users (Billions)': 1.89, 'Growth %': 13.1 },
        { Year: '2013', 'Google Search Users (Billions)': 2.12, 'Growth %': 12.1 },
        { Year: '2014', 'Google Search Users (Billions)': 2.35, 'Growth %': 10.8 },
        { Year: '2015', 'Google Search Users (Billions)': 2.58, 'Growth %': 9.8 },
        { Year: '2016', 'Google Search Users (Billions)': 2.81, 'Growth %': 8.9 },
        { Year: '2017', 'Google Search Users (Billions)': 3.04, 'Growth %': 8.2 },
        { Year: '2018', 'Google Search Users (Billions)': 3.27, 'Growth %': 7.6 },
        { Year: '2019', 'Google Search Users (Billions)': 3.50, 'Growth %': 7.0 },
        { Year: '2020', 'Google Search Users (Billions)': 3.85, 'Growth %': 10.0 },
        { Year: '2021', 'Google Search Users (Billions)': 4.21, 'Growth %': 9.35 },
        { Year: '2022', 'Google Search Users (Billions)': 4.58, 'Growth %': 8.78 },
        { Year: '2023', 'Google Search Users (Billions)': 4.96, 'Growth %': 8.29 },
        { Year: '2024', 'Google Search Users (Billions)': 5.35, 'Growth %': 7.86 },
      ];
      presetCols = [
        { name: 'Year', type: 'category' },
        { name: 'Google Search Users (Billions)', type: 'numeric' },
        { name: 'Growth %', type: 'numeric' },
      ];
    }

    setData(presetRows, presetCols);
    setSuccessMsg(`Loaded "${presetName === 'crypto' ? 'Cryptosphere' : presetName === 'ev' ? 'Global EV Adoption' : 'Google Search Users'}" preset!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm" id="data-importer-container">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase letter tracking-wider">
          Data File Source
        </h4>
        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
          <HelpCircle size={10} /> Supports CSV, XLSX, JSON
        </span>
      </div>

      {/* Drag & Drop Canvas Box */}
      <div
        id="drag-and-drop-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center py-6 px-4 border rounded-lg cursor-pointer transition duration-200 text-center ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-dashed border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex gap-2 mb-2">
          <FileSpreadsheet className="text-emerald-500" size={24} id="xlsx-icon" />
          <FileText className="text-blue-400" size={24} id="csv-icon" />
          <FileJson className="text-amber-500" size={24} id="json-icon" />
        </div>
        <p className="text-xs font-medium text-zinc-300">
          Drag & drop or <span className="text-indigo-400 font-semibold hover:underline">browse files</span>
        </p>
        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
          First column will be used as category labels
        </p>
      </div>

      {successMsg && (
        <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-800 rounded text-[11px] text-emerald-300 flex items-center gap-2">
          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sample presets buttons */}
      <div className="mt-4 pt-3 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-2">
          Try with instant templates:
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => loadPresetData('google')}
            className="px-2 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded transition text-left truncate"
            title="Google Users History (Time-series info)"
          >
            📉 Google Search
          </button>
          <button
            onClick={() => loadPresetData('crypto')}
            className="px-2 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded transition text-left truncate"
            title="Crypto giant valuations 2023-2024"
          >
            🪙 Cryptosphere
          </button>
          <button
            onClick={() => loadPresetData('ev')}
            className="px-2 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded transition text-left truncate"
            title="SaaS global electric vehicle brand share"
          >
            ⚡ EV Market Sales
          </button>
        </div>
      </div>
    </div>
  );
}
