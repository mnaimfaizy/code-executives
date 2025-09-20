import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, RotateCcw } from 'lucide-react';
import type { HashTableEntry, BaseVisualizationProps } from '../../../../types/datastructures';

interface HashTableVisualizationProps extends BaseVisualizationProps {
  initialData?: { key: string; value: string | number }[];
  tableSize?: number;
  hashFunction?: 'simple' | 'djb2' | 'fnv1a';
  collisionStrategy?: 'chaining' | 'linear-probing' | 'quadratic-probing';
  showHashCalculation?: boolean;
}

const HashTableVisualization: React.FC<HashTableVisualizationProps> = ({
  tableSize = 7,
  hashFunction = 'simple',
  collisionStrategy = 'chaining',
  showHashCalculation = true,
  className = '',
  onOperationComplete
}) => {
  const [entries, setEntries] = useState<HashTableEntry[]>([]);
  const [table, setTable] = useState<(HashTableEntry | null)[]>([]);
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [animatingEntry, setAnimatingEntry] = useState<string | null>(null);
  const [hashSteps, setHashSteps] = useState<{ key: string; calculation: string; result: number } | null>(null);
  const [collisionHighlight, setCollisionHighlight] = useState<number[]>([]);

  // Hash function implementations
  const calculateHash = useCallback((key: string): { hash: number; calculation: string } => {
    let hash = 0;
    let calculation = '';

    switch (hashFunction) {
      case 'simple':
        for (let i = 0; i < key.length; i++) {
          hash += key.charCodeAt(i);
        }
        calculation = `Sum of ASCII values: ${key.split('').map(c => c.charCodeAt(0)).join(' + ')} = ${hash}`;
        break;
      
      case 'djb2':
        hash = 5381;
        calculation = `hash = 5381; `;
        for (let i = 0; i < key.length; i++) {
          const char = key.charCodeAt(i);
          hash = ((hash << 5) + hash) + char;
          calculation += `hash = ((${hash >> 5} << 5) + ${hash >> 5}) + ${char}; `;
        }
        break;
      
      case 'fnv1a':
        hash = 2166136261;
        calculation = `hash = 2166136261; `;
        for (let i = 0; i < key.length; i++) {
          const char = key.charCodeAt(i);
          hash ^= char;
          hash *= 16777619;
          calculation += `hash ^= ${char}; hash *= 16777619; `;
        }
        break;
    }

    const finalHash = Math.abs(hash) % tableSize;
    calculation += ` → ${Math.abs(hash)} % ${tableSize} = ${finalHash}`;
    
    return { hash: finalHash, calculation };
  }, [hashFunction, tableSize]);

  // Initialize empty table
  useEffect(() => {
    const newTable = Array(tableSize).fill(null);
    setTable(newTable);
    setEntries([]);
  }, [tableSize]);

  // Handle collision resolution
  const findSlot = useCallback((key: string, hash: number): { slot: number; probeCount: number } => {
    if (collisionStrategy === 'chaining') {
      return { slot: hash, probeCount: 0 };
    }

    let slot = hash;
    let probeCount = 0;
    const visited: number[] = [];

    while (table[slot] !== null && table[slot]?.key !== key && probeCount < tableSize) {
      visited.push(slot);
      probeCount++;
      
      if (collisionStrategy === 'linear-probing') {
        slot = (slot + 1) % tableSize;
      } else if (collisionStrategy === 'quadratic-probing') {
        slot = (hash + probeCount * probeCount) % tableSize;
      }
    }

    setCollisionHighlight(visited);
    setTimeout(() => setCollisionHighlight([]), 2000);

    return { slot, probeCount };
  }, [table, tableSize, collisionStrategy]);

  // Insert operation
  const handleInsert = useCallback(() => {
    if (!inputKey.trim() || !inputValue.trim()) return;

    const { hash, calculation } = calculateHash(inputKey);
    if (showHashCalculation) {
      setHashSteps({ key: inputKey, calculation, result: hash });
    }

    const { slot, probeCount } = findSlot(inputKey, hash);
    
    const entryId = `${inputKey}-${Date.now()}`;
    const newEntry: HashTableEntry = {
      id: entryId,
      value: inputValue,
      key: inputKey,
      bucket: slot,
      highlighted: true,
      position: { x: 50 + slot * 80, y: 100 }
    };

    // Animate insertion
    setAnimatingEntry(entryId);
    
    if (collisionStrategy === 'chaining') {
      // Handle chaining
      const existingEntry = table[slot];
      if (existingEntry) {
        newEntry.collisionChain = existingEntry.collisionChain || [];
        newEntry.collisionChain.unshift(existingEntry.id);
      }
    }

    const newTable = [...table];
    newTable[slot] = newEntry;
    setTable(newTable);
    
    setEntries(prev => [...prev, newEntry]);
    setInputKey('');
    setInputValue('');

    // Animation cleanup and callback
    setTimeout(() => {
      setAnimatingEntry(null);
      setHashSteps(null);
      onOperationComplete?.({
        type: 'insert',
        target: inputKey,
        value: inputValue,
        description: `Inserted ${inputKey}: ${inputValue} at slot ${slot}${probeCount > 0 ? ` after ${probeCount} collisions` : ''}`,
        complexity: { time: 'O(1) avg, O(n) worst', space: 'O(1)' }
      });
    }, 1500);
  }, [inputKey, inputValue, calculateHash, findSlot, showHashCalculation, table, collisionStrategy, onOperationComplete]);

  // Search operation
  const handleSearch = useCallback(() => {
    if (!searchKey.trim()) return;

    const { hash } = calculateHash(searchKey);
    const { slot } = findSlot(searchKey, hash);
    
    const found = table[slot]?.key === searchKey;
    
    // Highlight search result
    const updatedEntries = entries.map(entry => ({
      ...entry,
      highlighted: entry.key === searchKey && found
    }));
    setEntries(updatedEntries);

    if (showHashCalculation) {
      const { calculation } = calculateHash(searchKey);
      setHashSteps({ key: searchKey, calculation, result: hash });
    }

    setTimeout(() => {
      setEntries(prev => prev.map(entry => ({ ...entry, highlighted: false })));
      setHashSteps(null);
    }, 2000);

    onOperationComplete?.({
      type: 'search',
      target: searchKey,
      description: `Search for ${searchKey}: ${found ? 'Found' : 'Not found'}${found ? ` at slot ${slot}` : ''}`,
      complexity: { time: 'O(1) avg, O(n) worst', space: 'O(1)' }
    });
  }, [searchKey, calculateHash, findSlot, table, entries, showHashCalculation, onOperationComplete]);

  // Delete operation
  const handleDelete = useCallback(() => {
    if (!searchKey.trim()) return;

    const { hash } = calculateHash(searchKey);
    const { slot } = findSlot(searchKey, hash);
    
    if (table[slot]?.key === searchKey) {
      const newTable = [...table];
      
      if (collisionStrategy === 'chaining' && table[slot]?.collisionChain?.length) {
        // Handle chaining deletion
        const chainedEntryId = table[slot]!.collisionChain![0];
        const chainedEntry = entries.find(e => e.id === chainedEntryId);
        if (chainedEntry) {
          newTable[slot] = {
            ...chainedEntry,
            collisionChain: table[slot]!.collisionChain!.slice(1)
          };
        }
      } else {
        newTable[slot] = null;
      }
      
      setTable(newTable);
      setEntries(prev => prev.filter(entry => entry.key !== searchKey));
      
      onOperationComplete?.({
        type: 'delete',
        target: searchKey,
        description: `Deleted ${searchKey} from slot ${slot}`,
        complexity: { time: 'O(1) avg, O(n) worst', space: 'O(1)' }
      });
    }

    setSearchKey('');
  }, [searchKey, calculateHash, findSlot, table, entries, collisionStrategy, onOperationComplete]);

  // Reset operation
  const handleReset = useCallback(() => {
    const newTable = Array(tableSize).fill(null);
    setTable(newTable);
    setEntries([]);
    setInputKey('');
    setInputValue('');
    setSearchKey('');
    setHashSteps(null);
    setCollisionHighlight([]);
    setAnimatingEntry(null);
  }, [tableSize]);

  const tableWidth = tableSize * 80 + 40;
  const tableHeight = 200;

  return (
    <div className={`hash-table-visualization ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <input
            type="text"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button
            onClick={handleInsert}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Insert</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search/Delete key"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button
            onClick={handleSearch}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Hash Calculation Display */}
      {hashSteps && showHashCalculation && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Hash Calculation for "{hashSteps.key}"
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
            {hashSteps.calculation}
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2">
            Result: Index {hashSteps.result}
          </p>
        </div>
      )}

      {/* Hash Table Visualization */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <svg
          width={tableWidth}
          height={tableHeight + 100}
          viewBox={`0 0 ${tableWidth} ${tableHeight + 100}`}
          className="w-full h-auto"
        >
          {/* Table indices */}
          {Array.from({ length: tableSize }, (_, i) => (
            <g key={`index-${i}`}>
              <text
                x={50 + i * 80}
                y={30}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-600 dark:fill-gray-400"
              >
                [{i}]
              </text>
            </g>
          ))}

          {/* Table slots */}
          {Array.from({ length: tableSize }, (_, i) => (
            <g key={`slot-${i}`}>
              <rect
                x={20 + i * 80}
                y={50}
                width={60}
                height={40}
                fill={collisionHighlight.includes(i) ? '#fef3c7' : 'transparent'}
                stroke={collisionHighlight.includes(i) ? '#f59e0b' : '#d1d5db'}
                strokeWidth={collisionHighlight.includes(i) ? 2 : 1}
                rx={4}
                className={`transition-all duration-300 ${
                  collisionHighlight.includes(i) ? 'animate-pulse' : ''
                }`}
              />
              
              {/* Entry display */}
              {table[i] && (
                <g>
                  <rect
                    x={22 + i * 80}
                    y={52}
                    width={56}
                    height={36}
                    fill={table[i]!.highlighted ? '#dbeafe' : '#f3f4f6'}
                    stroke={table[i]!.highlighted ? '#3b82f6' : '#9ca3af'}
                    strokeWidth={table[i]!.highlighted ? 2 : 1}
                    rx={2}
                    className={`transition-all duration-300 ${
                      animatingEntry === table[i]!.id ? 'animate-bounce' : ''
                    }`}
                  />
                  <text
                    x={50 + i * 80}
                    y={65}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                  >
                    {table[i]!.key}
                  </text>
                  <text
                    x={50 + i * 80}
                    y={78}
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-500"
                  >
                    {table[i]!.value}
                  </text>

                  {/* Collision chain indicator */}
                  {collisionStrategy === 'chaining' && table[i]!.collisionChain?.length && (
                    <g>
                      <circle
                        cx={70 + i * 80}
                        cy={55}
                        r={8}
                        fill="#fbbf24"
                        stroke="#f59e0b"
                        strokeWidth={1}
                      />
                      <text
                        x={70 + i * 80}
                        y={59}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white"
                      >
                        {table[i]!.collisionChain!.length}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          ))}

          {/* Hash function indicator */}
          <g>
            <rect
              x={10}
              y={tableHeight - 30}
              width={tableWidth - 20}
              height={60}
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth={1}
              rx={8}
            />
            <text
              x={50}
              y={tableHeight - 8}
              className="text-sm font-medium fill-gray-700 dark:fill-gray-300"
            >
              Hash Function: {hashFunction.toUpperCase()}
            </text>
            <text
              x={50}
              y={tableHeight + 8}
              className="text-sm fill-gray-500 dark:fill-gray-500"
            >
              Collision Resolution: {collisionStrategy.replace('-', ' ')}
            </text>
          </g>
        </svg>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {entries.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Entries</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {table.filter(slot => slot !== null).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Occupied Slots</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round((entries.length / tableSize) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Load Factor</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {collisionStrategy === 'chaining' ? 
              entries.reduce((acc, entry) => acc + (entry.collisionChain?.length || 0), 0) :
              0
            }
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Collisions</div>
        </div>
      </div>
    </div>
  );
};

export default HashTableVisualization;