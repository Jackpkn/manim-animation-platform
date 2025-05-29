// components/project/CodeEditorSection.tsx
import dynamic from "next/dynamic";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useRef } from "react";
import React from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorSectionProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditorSection = React.memo(function CodeEditorSection({
  value,
  onChange,
  language = "python",
}: CodeEditorSectionProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback(
    (
      editor: editor.IStandaloneCodeEditor,
      monacoInstance: typeof import("monaco-editor")
    ) => {
      editorRef.current = editor;

      // Define custom dark theme
      monacoInstance.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "identifier", foreground: "C5CCD6" },
          { token: "identifier.function", foreground: "7EBFFF" },
          { token: "type", foreground: "FFD68A" },
          { token: "keyword", foreground: "D388FF" },
          { token: "string", foreground: "A8D68A" },
          { token: "comment", foreground: "767C88" },
          { token: "number", foreground: "E5AA73" },
        ],
        colors: {
          "editor.background": "#0f172a", 
          "editor.foreground": "#e2e8f0", 
          "editor.lineHighlightBackground": "#1e293b", 
          "editor.selectionBackground": "#334155", 
          "editorCursor.foreground": "#3b82f6",  
          "editor.inactiveSelectionBackground": "#475569",  
          "editorLineNumber.foreground": "#64748b",  
          "editorLineNumber.activeForeground": "#94a3b8",  
        },
      });

      monacoInstance.editor.setTheme("custom-dark");
 
      editor.updateOptions({
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
        wordWrap: "on",
        wordWrapColumn: 120,
      });
    },
    []
  );

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-full w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        value={value}
        onChange={(newValue) => {
          if (newValue !== undefined) {
            onChange(newValue);
          }
        }}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
          lineNumbers: "on",
          tabSize: 4,
          automaticLayout: true,
          wordWrap: "on",
          wrappingIndent: "indent",
          smoothScrolling: true,
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "gutter",
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          mouseWheelZoom: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          parameterHints: {
            enabled: true,
          },
          autoIndent: "full",
          formatOnType: true,
          formatOnPaste: true,
          dragAndDrop: true,
          links: true,
          colorDecorators: true,

          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },
          hover: {
            enabled: true,
            delay: 300,
            sticky: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
          },
        }}
        loading={
          <div className="h-full w-full bg-slate-900 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
              <span>Loading Editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
});

export default CodeEditorSection;
