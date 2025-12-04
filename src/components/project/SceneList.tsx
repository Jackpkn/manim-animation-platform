import React from "react";
import { FileType } from "@/lib/project-hook";
import { cn } from "@/lib/utils";
import {
    Play,
    Clock,
    MoreVertical,
    GripVertical,
    Trash2,
    Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SceneListProps {
    files: FileType[];
    selectedFileId: string | null;
    selectedScenes: string[];
    onSelectFile: (file: FileType) => void;
    onToggleSceneSelection: (fileId: string, selected: boolean) => void;
    onRunScene: (file: FileType) => void;
}

export default function SceneList({
    files,
    selectedFileId,
    selectedScenes,
    onSelectFile,
    onToggleSceneSelection,
    onRunScene,
}: SceneListProps) {
    // Filter only files that look like scenes (e.g., .py files in the scenes folder)
    // For now, we assume the passed 'files' array is already the children of the scenes folder.

    return (
        <div className="space-y-2 p-2">
            {files.map((file) => (
                <div
                    key={file.id}
                    className={cn(
                        "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                        selectedFileId === file.id
                            ? "bg-slate-800 border-blue-500/50 shadow-lg shadow-blue-500/10"
                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
                    )}
                    onClick={() => onSelectFile(file)}
                >
                    {/* Drag Handle (Visual only for now) */}
                    <div className="text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Selection Checkbox */}
                    <div
                        className="relative flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={selectedScenes.includes(file.id)}
                            onChange={(e) => onToggleSceneSelection(file.id, e.target.checked)}
                            className="peer w-5 h-5 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50 cursor-pointer"
                        />
                    </div>

                    {/* Scene Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4
                                className={cn(
                                    "font-medium text-sm truncate",
                                    selectedFileId === file.id ? "text-blue-400" : "text-slate-200"
                                )}
                            >
                                {file.name.replace(".py", "")}
                            </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {file.duration || "5"}s
                            </span>
                            {file.sceneClass && (
                                <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                    {file.sceneClass}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-blue-500/20 hover:text-blue-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRunScene(file);
                            }}
                            title="Run this scene"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:bg-slate-700"
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                <DropdownMenuItem className="text-xs hover:bg-slate-800 cursor-pointer">
                                    <Edit2 className="w-3 h-3 mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-xs hover:bg-slate-800 text-red-400 cursor-pointer">
                                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );
}
