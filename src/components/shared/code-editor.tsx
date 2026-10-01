"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";
import { useTheme } from "next-themes";
import type { Extension } from "@codemirror/state";

function languageExtension(language?: string | null): Extension[] {
  switch ((language ?? "").toLowerCase()) {
    case "typescript":
    case "ts":
      return [javascript({ typescript: true })];
    case "python":
    case "py":
      return [python()];
    case "java":
      return [java()];
    case "sql":
      return [sql()];
    default:
      return [javascript()];
  }
}

export interface CodeEditorProps {
  id?: string;
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  minHeight?: string;
  ariaLabel?: string;
}

export default function CodeEditor({ id, value, onChange, language, readOnly, minHeight = "220px", ariaLabel }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div id={id} className="overflow-hidden rounded-lg border text-sm [&_.cm-editor.cm-focused]:outline-none" aria-label={ariaLabel}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={languageExtension(language)}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        readOnly={readOnly}
        editable={!readOnly}
        minHeight={minHeight}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: !readOnly, tabSize: 2 }}
      />
    </div>
  );
}
