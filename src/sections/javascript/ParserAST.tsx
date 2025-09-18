import React, { useEffect, useRef, useState } from 'react';
import TwoDLayout from '../../components/TwoDLayout';
import ModeTabs from '../../components/shared/ModeTabs';
import { type Speed } from '../../components/shared/RunnerToolbar';
import OutputPanel, { type OutputLine } from '../../components/shared/OutputPanel';
import Editor from '../../components/shared/Editor';
import useRunner from '../../hooks/useRunner';

// Simplified AST node structure for visualization
type ASTNode = {
  type: string;
  value?: string;
  children?: ASTNode[];
  position?: { line: number; column: number };
};

type Instruction =
  | { type: 'tokenize'; input: string; tokens: Token[] }
  | { type: 'parse'; tokens: Token[]; ast: ASTNode }
  | { type: 'highlight'; nodeType: string };

type Token = {
  type: string;
  value: string;
  start: number;
  end: number;
};

type Compiled = { program: Instruction[] };

// Simple tokenizer for demonstration
function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const patterns = [
    { type: 'KEYWORD', regex: /\b(function|const|let|var|if|else|for|while|return)\b/ },
    { type: 'IDENTIFIER', regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
    { type: 'NUMBER', regex: /\b\d+(\.\d+)?\b/ },
    { type: 'STRING', regex: /"[^"]*"|'[^']*'/ },
    { type: 'OPERATOR', regex: /[+\-*/=<>!&|]/ },
    { type: 'PUNCTUATION', regex: /[{}()[\];,.]/ },
    { type: 'WHITESPACE', regex: /\s+/ },
  ];

  let position = 0;
  while (position < code.length) {
    let matched = false;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, 'y');
      regex.lastIndex = position;
      const match = regex.exec(code);
      if (match) {
        if (pattern.type !== 'WHITESPACE') {
          tokens.push({
            type: pattern.type,
            value: match[0],
            start: position,
            end: position + match[0].length,
          });
        }
        position += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      position++;
    }
  }
  return tokens;
}

// Simple recursive descent parser for basic expressions
function parseExpression(tokens: Token[], start: number = 0): { node: ASTNode; end: number } {
  if (start >= tokens.length) {
    return { node: { type: 'Empty' }, end: start };
  }

  const token = tokens[start];

  if (token.type === 'KEYWORD' && token.value === 'function') {
    return parseFunctionDeclaration(tokens, start);
  } else if (token.type === 'IDENTIFIER') {
    if (start + 1 < tokens.length && tokens[start + 1].value === '(') {
      return parseFunctionCall(tokens, start);
    }
    return { node: { type: 'Identifier', value: token.value }, end: start + 1 };
  } else if (token.type === 'NUMBER') {
    return { node: { type: 'Literal', value: token.value }, end: start + 1 };
  }

  return { node: { type: 'Unknown', value: token.value }, end: start + 1 };
}

function parseFunctionDeclaration(tokens: Token[], start: number): { node: ASTNode; end: number } {
  let pos = start + 1; // skip 'function'
  const name = pos < tokens.length ? tokens[pos].value : 'anonymous';
  pos++; // skip name

  // Skip parameters for simplicity
  while (pos < tokens.length && tokens[pos].value !== '{') pos++;
  pos++; // skip '{'

  const children: ASTNode[] = [];
  while (pos < tokens.length && tokens[pos].value !== '}') {
    const { node, end } = parseExpression(tokens, pos);
    children.push(node);
    pos = end;
  }

  return {
    node: {
      type: 'FunctionDeclaration',
      value: name,
      children,
    },
    end: pos + 1,
  };
}

function parseFunctionCall(tokens: Token[], start: number): { node: ASTNode; end: number } {
  const name = tokens[start].value;
  let pos = start + 2; // skip name and '('

  const args: ASTNode[] = [];
  while (pos < tokens.length && tokens[pos].value !== ')') {
    if (tokens[pos].value !== ',') {
      const { node, end } = parseExpression(tokens, pos);
      args.push(node);
      pos = end;
    } else {
      pos++;
    }
  }

  return {
    node: {
      type: 'CallExpression',
      value: name,
      children: args,
    },
    end: pos + 1,
  };
}

const DEFAULT_JS = `function greet(name) {
  console.log("Hello, " + name);
}

const user = "World";
greet(user);`;

const DEFAULT_DSL = `// Parser demonstration DSL
// tokenize <code>
// parse <tokens>
tokenize function hello() { return 42; }
parse FUNCTION IDENTIFIER LPAREN RPAREN LBRACE RETURN NUMBER SEMICOLON RBRACE`;

// AST Visualization Component
const AST2D: React.FC<{ ast?: ASTNode; highlightType?: string }> = ({ ast, highlightType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ast) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw AST tree
    const drawNode = (node: ASTNode, x: number, y: number, level: number): number => {
      const nodeWidth = 120;
      const nodeHeight = 40;
      const levelHeight = 80;

      // Highlight active node type
      const isHighlighted = highlightType === node.type;

      // Draw node
      ctx.fillStyle = isHighlighted ? '#3b82f6' : '#e2e8f0';
      ctx.fillRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight);

      // Draw text
      ctx.fillStyle = isHighlighted ? '#ffffff' : '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.type, x, y - 5);
      if (node.value) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = isHighlighted ? '#e0f2fe' : '#64748b';
        ctx.fillText(node.value, x, y + 8);
      }

      // Draw children
      if (node.children && node.children.length > 0) {
        const childY = y + levelHeight;
        const totalWidth = node.children.length * 150;
        const startX = x - totalWidth / 2 + 75;

        node.children.forEach((child, i) => {
          const childX = startX + i * 150;

          // Draw connection line
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y + nodeHeight / 2);
          ctx.lineTo(childX, childY - nodeHeight / 2);
          ctx.stroke();

          drawNode(child, childX, childY, level + 1);
        });
      }

      return y + levelHeight;
    };

    drawNode(ast, width / 2, 60, 0);
  }, [ast, highlightType]);

  return (
    <canvas ref={canvasRef} className="h-full w-full" style={{ width: '100%', height: '100%' }} />
  );
};

const ParserAST: React.FC = () => {
  const [mode, setMode] = useState<'2D' | '3D'>('2D');
  const [inputMode, setInputMode] = useState<'js' | 'dsl'>('js');
  const [source, setSource] = useState<string>(DEFAULT_JS);
  const [output, setOutput] = useState<OutputLine[]>([{ text: 'Ready to parse.', kind: 'info' }]);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [currentTokens, setCurrentTokens] = useState<Token[]>([]);
  const [currentAST, setCurrentAST] = useState<ASTNode | undefined>();
  const [highlightType, setHighlightType] = useState<string>('');
  const compiledRef = useRef<Compiled | null>(null);

  const log = (msg: string, opts?: { kind?: OutputLine['kind'] }) =>
    setOutput((o) => [...o, { text: msg, kind: opts?.kind }]);

  const reset = () => {
    setCurrentTokens([]);
    setCurrentAST(undefined);
    setHighlightType('');
    setOutput([{ text: 'Reset.', kind: 'info' }]);
    compiledRef.current = null;
  };

  const ensureCompiled = (): Compiled => {
    if (compiledRef.current) return compiledRef.current;

    try {
      if (inputMode === 'js') {
        const tokens = tokenize(source);
        const { node: ast } = parseExpression(tokens);

        const program: Instruction[] = [
          { type: 'tokenize', input: source, tokens },
          { type: 'parse', tokens, ast },
        ];

        compiledRef.current = { program };
        return compiledRef.current;
      } else {
        // DSL mode - parse instructions
        const lines = source.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
        const program: Instruction[] = [];

        for (const line of lines) {
          const [cmd, ...rest] = line.trim().split(/\s+/);
          if (cmd === 'tokenize') {
            const input = rest.join(' ');
            const tokens = tokenize(input);
            program.push({ type: 'tokenize', input, tokens });
          } else if (cmd === 'parse') {
            const tokenTypes = rest;
            const tokens: Token[] = tokenTypes.map((type, i) => ({
              type,
              value: type.toLowerCase(),
              start: i * 5,
              end: (i + 1) * 5,
            }));
            const { node: ast } = parseExpression(tokens);
            program.push({ type: 'parse', tokens, ast });
          }
        }

        compiledRef.current = { program };
        return compiledRef.current;
      }
    } catch (e) {
      log(`Parse error: ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' });
      compiledRef.current = { program: [] };
      return compiledRef.current;
    }
  };

  const {
    toggleRun,
    step: runnerStep,
    setSpeed: setRunnerSpeed,
  } = useRunner<Instruction>({
    getProgram: () => ensureCompiled().program,
    apply: (ins) => {
      if (ins.type === 'tokenize') {
        setCurrentTokens(ins.tokens);
        log(`Tokenized: ${ins.tokens.length} tokens`, { kind: 'info' });
        log(`Tokens: ${ins.tokens.map((t) => `${t.type}(${t.value})`).join(', ')}`, {
          kind: 'log',
        });
      } else if (ins.type === 'parse') {
        setCurrentAST(ins.ast);
        log(`Parsed AST: ${ins.ast.type}`, { kind: 'info' });
        setHighlightType(ins.ast.type);
      } else if (ins.type === 'highlight') {
        setHighlightType(ins.nodeType);
        log(`Highlighting: ${ins.nodeType}`, { kind: 'info' });
      }
    },
    getIntervalMs: (s) => (s === 'very-slow' ? 2000 : s === 'slow' ? 1200 : 600),
    onComplete: () => log('Parsing complete.', { kind: 'info' }),
  });

  useEffect(() => {
    setRunnerSpeed(speed);
  }, [speed, setRunnerSpeed]);

  const step = () => {
    runnerStep();
  };

  const run = () => {
    toggleRun();
  };

  const editor = (
    <Editor
      title="Source Code"
      selectId="parser-input-mode-select"
      inputMode={inputMode}
      onInputModeChange={(mode) => {
        setInputMode(mode);
        setSource(mode === 'js' ? DEFAULT_JS : DEFAULT_DSL);
        reset();
      }}
      source={source}
      onSourceChange={(val) => {
        setSource(val);
        compiledRef.current = null;
      }}
      placeholderJs="Write JavaScript code to see tokenization and AST parsing"
      placeholderDsl="Use: tokenize <code> | parse <token-types>"
      showHighlighted={false}
      running={false}
      speed={speed}
      onRunToggle={run}
      onStep={step}
      onReset={reset}
      onSpeedChange={(s) => setSpeed(s)}
      onLoadExample={() => {
        const sample = inputMode === 'js' ? DEFAULT_JS : DEFAULT_DSL;
        setSource(sample);
        reset();
      }}
      onClear={() => setSource('')}
    />
  );

  const outputPanel = <OutputPanel lines={output} colorForLabel={() => undefined} />;

  const canvas2D = (
    <div className="flex h-full flex-col gap-2 p-2">
      {/* Tokens Display */}
      <div className="rounded-md border border-gray-300 p-2" style={{ height: '30%' }}>
        <h4 className="mb-2 text-sm font-semibold">Tokens</h4>
        <div className="flex flex-wrap gap-1 text-xs">
          {currentTokens.map((token, i) => (
            <span
              key={i}
              className="rounded px-2 py-1"
              style={{
                backgroundColor:
                  token.type === 'KEYWORD'
                    ? '#dbeafe'
                    : token.type === 'IDENTIFIER'
                      ? '#dcfce7'
                      : token.type === 'NUMBER'
                        ? '#fef3c7'
                        : token.type === 'STRING'
                          ? '#fce7f3'
                          : '#f1f5f9',
                color: '#1e293b',
              }}
            >
              {token.type}:{token.value}
            </span>
          ))}
        </div>
      </div>

      {/* AST Visualization */}
      <div className="flex-1 rounded-md border border-gray-300">
        <div className="p-2">
          <h4 className="text-sm font-semibold">Abstract Syntax Tree</h4>
        </div>
        <div className="h-full">
          <AST2D ast={currentAST} highlightType={highlightType} />
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-4">
      <h2 className="text-base font-semibold">Parser & Abstract Syntax Tree</h2>

      {/* Engine Context Introduction */}
      <div className="mb-4 rounded-lg bg-purple-50 p-3">
        <h3 className="mb-2 text-sm font-semibold text-purple-900">Role in JavaScript Engine</h3>
        <p className="mb-2 text-xs text-purple-800">
          The Parser is the first major component in the JavaScript engine pipeline. It transforms
          source code into tokens (lexical analysis) and then builds an Abstract Syntax Tree
          (syntactic analysis).
        </p>
        <p className="text-xs text-purple-700">
          <strong>Engine Pipeline:</strong> Source Code → Tokenization → Parsing → AST → Bytecode
          Generation
        </p>
      </div>

      {/* Theory Section */}
      <div className="mb-3">
        <h3 className="mb-2 text-sm font-semibold">Parsing Process</h3>
        <p className="mb-2 text-sm text-gray-700">
          Parsing involves two main phases: lexical analysis (tokenization) and syntactic analysis
          (AST construction). The parser validates syntax and creates a structured representation
          for the compiler.
        </p>
        <div className="mb-2 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-2">
          <div>
            <strong>Lexical Analysis:</strong>
            <ul className="ml-3 list-disc">
              <li>Break code into tokens</li>
              <li>Identify keywords, operators</li>
              <li>Handle literals & identifiers</li>
              <li>Skip whitespace & comments</li>
            </ul>
          </div>
          <div>
            <strong>Syntactic Analysis:</strong>
            <ul className="ml-3 list-disc">
              <li>Build Abstract Syntax Tree</li>
              <li>Validate grammar rules</li>
              <li>Handle precedence & associativity</li>
              <li>Detect syntax errors</li>
            </ul>
          </div>
        </div>
      </div>

      <ModeTabs mode={mode} onChange={setMode} />

      {mode === '2D' ? (
        <div className="mt-2">
          <TwoDLayout
            title="2D Visualization: Parser & AST"
            editor={editor}
            output={outputPanel}
            canvas={canvas2D}
          />
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          3D visualization for Parser & AST is coming soon.
        </div>
      )}
    </section>
  );
};

export default ParserAST;
