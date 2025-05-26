import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { editor } from "monaco-editor";
import { File, X } from "lucide-react"; // Import File and X icons
import { FileType } from "./FileExplorer"; // Import FileType
import { cn } from "@/lib/utils";

const PythonFileIcon = () => (
  <img src="/python.svg" alt="python icon" className="w-4 h-4" />
);

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorSectionProps {
  code: string;
  onCodeChange: (code: string) => void;
  openFiles: FileType[]; // Array of open files
  onCloseFile: (fileId: string) => void; // Function to close file
  selectedFile: FileType | null;
  setSelectedFile: (file: FileType | null) => void;
}

const CodeEditorSection = React.memo(function CodeEditorSection({
  code,
  onCodeChange,
  openFiles,
  onCloseFile,
  selectedFile,
  setSelectedFile,
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
        "editor.background": "#101828",
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
      <div className="flex items-center mb-2 overflow-x-auto mt-2">
        {openFiles.length > 0 ? (
          openFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center space-x-2 border rounded-md px-2 py-1 cursor-pointer ml-2",
                file.id === selectedFile?.id
                  ? "border-orange-400 border-[1px] text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <button
                onClick={() => setSelectedFile(file)}
                className="flex items-center space-x-1"
              >
                {file.name.endsWith(".py") ? (
                  <PythonFileIcon />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="text-sm">{file.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab click
                  onCloseFile(file.id);
                }}
                className="hover:text-red-500"
                aria-label={`Close ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <h2 className="text-lg font-semibold">Code Editor</h2>
        )}
      </div>
      <div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex-1">
        <MonacoEditor
          height="100%"
          language="python"
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
