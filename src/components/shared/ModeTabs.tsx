import React from 'react';

type Mode = '2D' | '3D';

type Props = {
  mode: Mode;
  onChange: (m: Mode) => void;
};

const ModeTabs: React.FC<Props> = ({ mode, onChange }) => {
  return (
    <div className="mt-2 border-b">
      <nav className="flex gap-2">
        {(['2D', '3D'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              mode === m
                ? 'border-indigo-600 font-medium text-indigo-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {m}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ModeTabs;
