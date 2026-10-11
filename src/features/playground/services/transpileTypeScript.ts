/**
 * Strip the types from the learner's TypeScript so it can be instrumented and run.
 *
 * Uses the TypeScript worker that Monaco already ships for the editor, so there is
 * no compiler in our bundle: `loader.init()` resolves to the same lazily loaded
 * Monaco the editor uses. The emit does not down-level (target and module are
 * ESNext, no helpers), and it comes with a source map so that every line reported
 * for the emitted code can be turned back into a line of the TypeScript source.
 */

import { loader, type Monaco } from '@monaco-editor/react';
import type { editor, Uri } from 'monaco-editor';
import { createLineMapper } from './sourceMapLines';

export type TranspileResult =
  | {
      ok: true;
      /** JavaScript with the types removed */
      code: string;
      /** Turns a line of `code` into the line of the TypeScript source (both 1-based) */
      mapLine: (line: number) => number;
    }
  | {
      ok: false;
      /** What went wrong, ready for the Console */
      message: string;
      /** Line of the TypeScript source (1-based), when the failure has one */
      line?: number;
    };

// The parts of Monaco's TypeScript API used here. Monaco moved the namespace from
// `monaco.languages.typescript` to `monaco.typescript` in 0.55, so it is looked up
// in both places and described structurally.
interface DiagnosticMessageChain {
  messageText: string;
}

interface SyntaxDiagnostic {
  start?: number;
  messageText: string | DiagnosticMessageChain;
}

interface EmitOutput {
  outputFiles: Array<{ name: string; text: string }>;
  emitSkipped: boolean;
}

interface TypeScriptWorker {
  getSyntacticDiagnostics(fileName: string): Promise<SyntaxDiagnostic[]>;
  getEmitOutput(fileName: string): Promise<EmitOutput>;
}

interface TypeScriptApi {
  ScriptTarget: { ESNext: number };
  ModuleKind: { ESNext: number };
  typescriptDefaults: {
    getCompilerOptions(): Record<string, unknown>;
    setCompilerOptions(options: Record<string, unknown>): void;
  };
  getTypeScriptWorker(): Promise<(...uris: Uri[]) => Promise<TypeScriptWorker>>;
}

function getTypeScriptApi(monaco: Monaco): TypeScriptApi {
  const candidates = [
    (monaco as unknown as { typescript?: Partial<TypeScriptApi> }).typescript,
    (monaco.languages as unknown as { typescript?: Partial<TypeScriptApi> }).typescript,
  ];
  const api = candidates.find((candidate) => typeof candidate?.getTypeScriptWorker === 'function');
  if (!api) throw new Error('the editor has no TypeScript support');
  return api as TypeScriptApi;
}

let compilerOptionsSet = false;

/** Ask for an emit that keeps the code as written, with a source map. Done once. */
function ensureCompilerOptions(ts: TypeScriptApi): void {
  if (compilerOptionsSet) return;
  ts.typescriptDefaults.setCompilerOptions({
    ...ts.typescriptDefaults.getCompilerOptions(),
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    sourceMap: true,
    noEmitHelpers: true,
    importHelpers: false,
    removeComments: false,
  });
  compilerOptionsSet = true;
}

/**
 * The editor's own model when it holds exactly this source, so that no second
 * copy of the learner's declarations exists while the worker reads it.
 */
function findEditorModel(monaco: Monaco, source: string): editor.ITextModel | undefined {
  const models: editor.ITextModel[] = monaco.editor.getModels();
  return models.find(
    (model) => model.getLanguageId() === 'typescript' && model.getValue() === source
  );
}

const SCRATCH_URI = 'file:///playground-run.ts';

/** A model of our own for the source, when the editor does not hold it (any more) */
function createScratchModel(monaco: Monaco, source: string): editor.ITextModel {
  const uri = monaco.Uri.parse(SCRATCH_URI);
  monaco.editor.getModel(uri)?.dispose();
  return monaco.editor.createModel(source, 'typescript', uri);
}

export async function transpileTypeScript(source: string): Promise<TranspileResult> {
  let scratch: editor.ITextModel | undefined;

  try {
    const monaco = await loader.init();
    const ts = getTypeScriptApi(monaco);
    ensureCompilerOptions(ts);

    const model: editor.ITextModel =
      findEditorModel(monaco, source) ?? (scratch = createScratchModel(monaco, source));

    const getWorker = await ts.getTypeScriptWorker();
    const worker = await getWorker(model.uri);
    const fileName = model.uri.toString();

    const syntaxErrors = await worker.getSyntacticDiagnostics(fileName);
    if (syntaxErrors.length > 0) {
      const first = syntaxErrors[0];
      const text =
        typeof first.messageText === 'string' ? first.messageText : first.messageText.messageText;
      return {
        ok: false,
        message: `TypeScript syntax error: ${text}`,
        line: first.start === undefined ? undefined : model.getPositionAt(first.start).lineNumber,
      };
    }

    const output = await worker.getEmitOutput(fileName);
    const js = output.outputFiles.find((file) => file.name.endsWith('.js'));
    const map = output.outputFiles.find((file) => file.name.endsWith('.js.map'));
    if (output.emitSkipped || !js) {
      return {
        ok: false,
        message: 'TypeScript could not be compiled: the compiler emitted nothing',
      };
    }

    const mappings = map ? (JSON.parse(map.text) as { mappings?: string }).mappings : null;
    return {
      ok: true,
      // The comment that points at the map is the last line; nothing fetches it here
      code: js.text.replace(/\r?\n?\/\/# sourceMappingURL=.*\s*$/, '\n'),
      mapLine: createLineMapper(mappings),
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `TypeScript could not be compiled: ${reason}` };
  } finally {
    scratch?.dispose();
  }
}
