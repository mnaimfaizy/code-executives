import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VisualizationControls from '../../../../../components/shared/VisualizationControls';

interface ExceptionBox {
  name: string;
  x: number;
  y: number;
  color: string;
  active?: boolean;
  caught?: boolean;
}

interface EHStep {
  title: string;
  description: string;
  boxes: ExceptionBox[];
  arrows: { from: string; to: string; label?: string }[];
  flow: string[];
  codeSnippet: string;
}

const ErrorHandling2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo<EHStep[]>(
    () => [
      {
        title: 'Exception Hierarchy',
        description: 'Python exceptions form a class hierarchy rooted at BaseException',
        boxes: [
          { name: 'BaseException', x: 240, y: 10, color: '#6b7280' },
          { name: 'Exception', x: 240, y: 70, color: '#3b82f6', active: true },
          { name: 'ValueError', x: 80, y: 140, color: '#ef4444' },
          { name: 'TypeError', x: 240, y: 140, color: '#f59e0b' },
          { name: 'KeyError', x: 400, y: 140, color: '#8b5cf6' },
          { name: 'RuntimeError', x: 80, y: 200, color: '#ec4899' },
          { name: 'IOError', x: 240, y: 200, color: '#10b981' },
          { name: 'StopIteration', x: 400, y: 200, color: '#6366f1' },
        ],
        arrows: [
          { from: 'BaseException', to: 'Exception' },
          { from: 'Exception', to: 'ValueError' },
          { from: 'Exception', to: 'TypeError' },
          { from: 'Exception', to: 'KeyError' },
          { from: 'Exception', to: 'RuntimeError' },
          { from: 'Exception', to: 'IOError' },
          { from: 'Exception', to: 'StopIteration' },
        ],
        flow: [
          'All exceptions inherit from BaseException',
          'User code should catch Exception (not BaseException)',
          'ValueError, TypeError, KeyError are most common',
          'Custom exceptions should inherit from Exception',
        ],
        codeSnippet: `# Exception Hierarchy\nBaseException\n ├── SystemExit\n ├── KeyboardInterrupt\n └── Exception\n     ├── ValueError\n     ├── TypeError\n     ├── KeyError\n     ├── IndexError\n     ├── FileNotFoundError\n     └── ...your custom exceptions`,
      },
      {
        title: 'try / except / else / finally',
        description: 'The complete error handling flow in Python',
        boxes: [
          { name: 'try', x: 120, y: 30, color: '#3b82f6', active: true },
          { name: 'except', x: 340, y: 30, color: '#ef4444' },
          { name: 'else', x: 120, y: 140, color: '#10b981' },
          { name: 'finally', x: 340, y: 140, color: '#8b5cf6', active: true },
        ],
        arrows: [
          { from: 'try', to: 'except', label: 'error raised' },
          { from: 'try', to: 'else', label: 'no error' },
          { from: 'except', to: 'finally', label: 'always' },
          { from: 'else', to: 'finally', label: 'always' },
        ],
        flow: [
          'try: code that might raise an exception',
          'except: runs only if an exception occurs',
          'else: runs only if NO exception occurs',
          'finally: ALWAYS runs (cleanup)',
        ],
        codeSnippet: `try:\n    result = int(user_input)\nexcept ValueError as e:\n    print(f"Invalid: {e}")\nexcept (TypeError, KeyError):\n    print("Wrong type or key")\nelse:\n    print(f"Success: {result}")\nfinally:\n    print("Cleanup runs always")`,
      },
      {
        title: 'Context Managers (with statement)',
        description: 'Automatic resource management — the Pythonic way',
        boxes: [
          { name: '__enter__', x: 120, y: 40, color: '#3b82f6', active: true },
          { name: 'with body', x: 280, y: 40, color: '#10b981', active: true },
          { name: '__exit__', x: 440, y: 40, color: '#ef4444' },
          { name: 'Resource', x: 280, y: 150, color: '#8b5cf6' },
        ],
        arrows: [
          { from: '__enter__', to: 'with body', label: 'acquire' },
          { from: 'with body', to: '__exit__', label: 'release' },
        ],
        flow: [
          'with statement calls __enter__() on entry',
          'Executes the body of the with block',
          '__exit__() is called even if an exception occurs',
          'Guarantees cleanup: files closed, locks released',
        ],
        codeSnippet: `# File handling — always closes the file\nwith open("data.txt") as f:\n    content = f.read()\n# f is automatically closed here\n\n# Multiple context managers\nwith open("in.txt") as src, open("out.txt", "w") as dst:\n    dst.write(src.read())\n\n# Database connection\nwith db.connect() as conn:\n    conn.execute("INSERT INTO ...")`,
      },
      {
        title: 'Custom Exceptions',
        description: 'Create domain-specific exceptions for better error handling',
        boxes: [
          { name: 'Exception', x: 240, y: 10, color: '#6b7280' },
          { name: 'AppError', x: 240, y: 80, color: '#3b82f6', active: true },
          { name: 'ValidationError', x: 100, y: 160, color: '#ef4444', active: true },
          { name: 'NotFoundError', x: 380, y: 160, color: '#f59e0b', active: true },
        ],
        arrows: [
          { from: 'Exception', to: 'AppError' },
          { from: 'AppError', to: 'ValidationError' },
          { from: 'AppError', to: 'NotFoundError' },
        ],
        flow: [
          'Inherit from Exception (or a specific subclass)',
          'Add custom attributes (error_code, details)',
          'Create a hierarchy for your application',
          'Callers can catch specific or general exceptions',
        ],
        codeSnippet: `class AppError(Exception):\n    """Base exception for our app."""\n    def __init__(self, message, code=None):\n        super().__init__(message)\n        self.code = code\n\nclass ValidationError(AppError):\n    def __init__(self, field, message):\n        super().__init__(f"{field}: {message}", code=400)\n        self.field = field\n\nclass NotFoundError(AppError):\n    def __init__(self, resource, id):\n        super().__init__(f"{resource} {id} not found", code=404)`,
      },
      {
        title: 'Exception Chaining',
        description: 'Preserve the original cause when re-raising exceptions',
        boxes: [
          { name: 'Original Error', x: 80, y: 60, color: '#ef4444', active: true },
          { name: 'raise ... from', x: 260, y: 60, color: '#f59e0b', active: true },
          { name: 'New Error', x: 440, y: 60, color: '#8b5cf6', active: true },
          { name: '__cause__', x: 260, y: 160, color: '#6b7280' },
        ],
        arrows: [
          { from: 'Original Error', to: 'raise ... from', label: 'caught' },
          { from: 'raise ... from', to: 'New Error', label: 'wrapped' },
          { from: 'New Error', to: '__cause__', label: 'preserves' },
        ],
        flow: [
          '"raise X from Y" links the new exception to the cause',
          'Traceback shows both the original and new error',
          '__cause__ attribute stores the original exception',
          'Use for wrapping low-level errors in domain errors',
        ],
        codeSnippet: `try:\n    value = int(raw_input)\nexcept ValueError as e:\n    # Chain: new error keeps reference to original\n    raise ValidationError("age", "must be a number") from e\n\n# Traceback shows:\n#   ValueError: invalid literal for int()\n# The above exception was the direct cause of:\n#   ValidationError: age: must be a number`,
      },
    ],
    []
  );

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);
  const handleStepBack = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const handleStepForward = useCallback(
    () => setCurrentStep((s) => Math.min(steps.length - 1, s + 1)),
    [steps.length]
  );
  const handleSpeedChange = useCallback((s: number) => setSpeed(s), []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;
    const interval = window.setInterval(() => {
      setCurrentStep((s) => {
        if (s >= steps.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 4000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const getBoxCenter = (box: ExceptionBox): { cx: number; cy: number } => ({
    cx: box.x + 50,
    cy: box.y + 18,
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
        <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <svg viewBox="0 0 600 240" className="w-full" style={{ maxHeight: '240px' }}>
          {/* Arrows */}
          {step.arrows.map((arrow, i) => {
            const fromBox = step.boxes.find((b) => b.name === arrow.from);
            const toBox = step.boxes.find((b) => b.name === arrow.to);
            if (!fromBox || !toBox) return null;
            const from = getBoxCenter(fromBox);
            const to = getBoxCenter(toBox);
            return (
              <g key={i}>
                <line
                  x1={from.cx}
                  y1={from.cy + 18}
                  x2={to.cx}
                  y2={to.cy - 18}
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                {arrow.label && (
                  <text
                    x={(from.cx + to.cx) / 2 + 5}
                    y={(from.cy + to.cy) / 2 + 4}
                    fontSize="9"
                    fill="#6b7280"
                    fontStyle="italic"
                  >
                    {arrow.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Boxes */}
          {step.boxes.map((box, i) => {
            const width = Math.max(box.name.length * 8 + 20, 100);
            return (
              <g key={i}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={width}
                  height={36}
                  rx="8"
                  fill={box.active ? `${box.color}15` : 'white'}
                  stroke={box.color}
                  strokeWidth={box.active ? 2 : 1.5}
                  className="transition-all duration-500"
                />
                <text
                  x={box.x + width / 2}
                  y={box.y + 22}
                  fontSize="11"
                  fill={box.color}
                  textAnchor="middle"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {box.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bg-[#1e1e2e] rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto">
        <pre className="whitespace-pre-wrap">{step.codeSnippet}</pre>
      </div>

      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <h5 className="font-semibold text-red-800 mb-2">💡 Key Points</h5>
        <ul className="space-y-1">
          {step.flow.map((point, i) => (
            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <VisualizationControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={steps.length}
        speed={speed}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  );
};

export default React.memo(ErrorHandling2D);
