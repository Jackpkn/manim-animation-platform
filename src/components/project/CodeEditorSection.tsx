import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { editor } from "monaco-editor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorSectionProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunAnimation: () => void;
  isExecuting: boolean;
}

const CodeEditorSection = React.memo(function CodeEditorSection({
  code,
  onCodeChange,
  onRunAnimation,
  isExecuting,
}: CodeEditorSectionProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monacoInstance: typeof import("monaco-editor")
  ) => {
    editorRef.current = editor;

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
        "editor.background": "#000000",
        "editor.foreground": "#C5CCD6",
        "editor.lineHighlightBackground": "#2F353F",
        "editor.selectionBackground": "#404859",
        "editorCursor.foreground": "#61A0FF",
      },
    });

    monacoInstance.editor.setTheme("custom-dark");
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <Button onClick={onRunAnimation} disabled={isExecuting}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Run Animation
        </Button>
      </div>
      <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex-1">
        <MonacoEditor
          height="100%"
          language="python"
          theme="custom-dark"
          value={code}
          onChange={(value) => {
            if (value !== undefined) {
              onCodeChange(value);
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "monospace",
            lineNumbers: "on",
            tabSize: 4,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
});

export default CodeEditorSection;
