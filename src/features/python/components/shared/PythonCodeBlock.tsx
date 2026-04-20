import React, { useState, useCallback, useMemo } from 'react';

interface PythonCodeBlockProps {
  code: string;
  title?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  output?: string;
}

/** Simple keyword-based syntax coloring for Python code. */
function tokenizeLine(line: string): React.ReactNode[] {
  const pattern =
    /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|'''[\s\S]*?'''|"""[\s\S]*?"""|f'(?:[^'\\]|\\.)*'|f"(?:[^"\\]|\\.)*")|(\b(?:import|from|as|def|class|return|if|elif|else|for|while|do|try|except|finally|raise|with|assert|yield|lambda|pass|break|continue|async|await|global|nonlocal|del|in|not|and|or|is)\b)|(\b(?:int|float|str|bool|list|dict|tuple|set|frozenset|bytes|bytearray|None|type|object|range|complex|memoryview)\b)|(\b(?:True|False|None)\b)|(\b\d[\d_.]*(?:j)?\b)|(self|cls)|(@\w+)|([[\]{}();,.:?!<>=+\-*/&|^~%@])/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    const [full, comment, str, keyword, builtinType, literal, num, selfCls, decorator, punct] =
      match;
    let cls = '';
    if (comment) cls = 'text-gray-500 italic';
    else if (str) cls = 'text-emerald-400';
    else if (keyword) cls = 'text-purple-400 font-semibold';
    else if (builtinType) cls = 'text-cyan-400';
    else if (literal) cls = 'text-orange-400';
    else if (num) cls = 'text-orange-300';
    else if (selfCls) cls = 'text-red-400 italic';
    else if (decorator) cls = 'text-yellow-400';
    else if (punct) cls = 'text-gray-400';

    nodes.push(
      <span key={match.index} className={cls}>
        {full}
      </span>
    );
    lastIndex = match.index + full.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes;
}

const PythonCodeBlock: React.FC<PythonCodeBlockProps> = ({
  code,
  title,
  highlightLines = [],
  showLineNumbers = true,
  maxHeight = '28rem',
  className = '',
  output,
}) => {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines]);

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-700/50 shadow-lg ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/90 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          {title && (
            <span className="ml-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase">python</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-gray-700/60 text-gray-300 hover:bg-gray-600/80 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="overflow-auto bg-[#1e1e2e] text-sm font-mono leading-6" style={{ maxHeight }}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightSet.has(lineNum);
              return (
                <tr
                  key={i}
                  className={`${isHighlighted ? 'bg-indigo-500/15' : 'hover:bg-white/[0.03]'} transition-colors`}
                >
                  {showLineNumbers && (
                    <td className="select-none text-right pr-4 pl-4 text-gray-600 text-xs w-12 align-top pt-0.5 border-r border-gray-700/30">
                      {lineNum}
                    </td>
                  )}
                  <td className="pl-4 pr-4 text-gray-200 whitespace-pre">
                    {isHighlighted && (
                      <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full mr-2 -mb-0.5" />
                    )}
                    {tokenizeLine(line)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Output section */}
      {output && (
        <div className="border-t border-gray-700/50 bg-[#161622] px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider">
              ▶ Output
            </span>
          </div>
          <pre className="text-sm font-mono text-green-300 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default React.memo(PythonCodeBlock);
