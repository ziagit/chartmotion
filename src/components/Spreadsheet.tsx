import React, { useState } from 'react';
import { Plus, Trash2, Hash, Type, Calendar, PlusCircle, HelpCircle } from 'lucide-react';
import { useStore } from '../store';

export default function Spreadsheet() {
  const {
    data,
    columns,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
  } = useStore();

  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<'numeric' | 'category' | 'date'>('numeric');
  const [isAddingCol, setIsAddingCol] = useState(false);

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addColumn(newColName.trim(), newColType);
    setNewColName('');
    setIsAddingCol(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric':
        return <Hash size={12} className="text-blue-400 shrink-0" />;
      case 'date':
        return <Calendar size={12} className="text-emerald-400 shrink-0" />;
      default:
        return <Type size={12} className="text-amber-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800" id="spreadsheet-container">
      {/* Spreadsheet toolbars */}
      <div className="p-3 border-b border-zinc-800 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-300">Spreadsheet Panel</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-indigo-950/50 text-indigo-400 rounded-md font-mono border border-indigo-900">
            {data.length} Rows × {columns.length} Cols
          </span>
        </div>

        <div className="flex gap-2">
          {/* Add Column Trigger */}
          <button
            onClick={() => setIsAddingCol(!isAddingCol)}
            className="px-2.5 py-1 text-[11px] bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded text-zinc-300 transition flex items-center gap-1"
          >
            <PlusCircle size={12} />
            + Variable
          </button>

          {/* Add Row Trigger */}
          <button
            onClick={addRow}
            className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium transition flex items-center gap-1"
          >
            <Plus size={12} />
            + Add Row
          </button>
        </div>
      </div>

      {isAddingCol && (
        <form onSubmit={handleAddColumnSubmit} className="p-3 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-zinc-400">Add Custom Column Variable</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="e.g. Revenue (M)"
              className="flex-1 px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-200"
            />
            <select
              value={newColType}
              onChange={(e) => setNewColType(e.target.value as any)}
              className="px-1.5 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded focus:border-indigo-500 text-zinc-300"
            >
              <option value="numeric">123 Numeric</option>
              <option value="category">Abc Label</option>
              <option value="date">📅 Temporal Date</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsAddingCol(false)}
              className="px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-[11px] bg-indigo-600 rounded hover:bg-indigo-500 font-medium text-white"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Spreadsheet Data Grid */}
      <div className="flex-1 overflow-auto max-h-[350px] scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-zinc-900/80 sticky top-0 border-b border-zinc-800 select-none z-10">
            <tr>
              <th className="p-2 w-10 text-center font-mono text-zinc-500 border-r border-zinc-800">#</th>
              {columns.map((col) => (
                <th key={col.name} className="p-2 border-r border-zinc-800 min-w-[120px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5 truncate">
                      {getTypeIcon(col.type)}
                      {col.name}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete column "${col.name}"?`)) {
                          deleteColumn(col.name);
                        }
                      }}
                      className="text-zinc-600 hover:text-red-400 p-0.5 rounded transition"
                      title="Delete variable"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-2 w-10 text-center text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-zinc-900 hover:bg-zinc-900/40 group">
                <td className="p-2 text-center font-mono text-zinc-500 bg-zinc-950 border-r border-zinc-800">
                  {rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td key={col.name} className="p-1.5 border-r border-zinc-900">
                    <input
                      type={col.type === 'numeric' ? 'number' : 'text'}
                      value={row[col.name] !== undefined ? row[col.name] : ''}
                      step="any"
                      onChange={(e) => updateCell(rowIndex, col.name, e.target.value)}
                      className="w-full block bg-transparent hover:bg-zinc-800/40 focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 py-1 px-1.5 rounded transition text-zinc-200 text-xs border border-transparent font-medium"
                    />
                  </td>
                ))}
                <td className="p-1.5 text-center">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="text-zinc-600 hover:text-red-400 p-1 rounded opacity-40 group-hover:opacity-100 transition"
                    title="Delete row"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            No rows found. Import a file above or click "+ Add Row" to begin entering numbers!
          </div>
        )}
      </div>
    </div>
  );
}
