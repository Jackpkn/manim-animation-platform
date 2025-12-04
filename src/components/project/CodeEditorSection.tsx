// components/project/CodeEditorSection.tsx
import dynamic from "next/dynamic";
import { editor } from "monaco-editor";
import { useCallback, useEffect, useRef } from "react";
import React from "react";
import { X } from "lucide-react";
import { FileType } from "./FileExplorer";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorSectionProps {
  code: string;
  onCodeChange: (value: string) => void;
  language?: string;
  openFiles?: FileType[];
  onCloseFile?: (fileId: string) => void;
  selectedFile?: FileType | null;
  setSelectedFile?: (file: FileType) => void;
}

const CodeEditorSection = React.memo(function CodeEditorSection({
  code,
  onCodeChange,
  language = "python",
  openFiles = [],
  onCloseFile,
  selectedFile,
  setSelectedFile,
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
    <div className="h-full w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50 flex flex-col">
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="flex bg-slate-950 border-b border-slate-800 overflow-x-auto">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`
                group flex items-center px-3 py-2 text-sm cursor-pointer border-r border-slate-800 min-w-[120px] max-w-[200px]
                ${selectedFile?.id === file.id
                  ? "bg-slate-900 text-blue-400 border-t-2 border-t-blue-500"
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                }
              `}
              onClick={() => setSelectedFile && setSelectedFile(file)}
            >
              <span className="truncate flex-1 mr-2">{file.name}</span>
              {onCloseFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-all"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          value={code}
          onChange={(newValue) => {
            if (newValue !== undefined) {
              onCodeChange(newValue);
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
    </div>
  );
});

export default CodeEditorSection;
