"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, FileVideo, Edit, Film, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Scene } from "@/lib/types";

interface SceneSidebarProps {
  scenes: Scene[];
  activeSceneId?: string;
  onAddScene: (name: string) => void;
  onDeleteScene: (id: string) => void;
}

export function SceneSidebar({
  scenes,
  activeSceneId,
  onAddScene,
  onDeleteScene,
}: SceneSidebarProps) {
  const [newSceneName, setNewSceneName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddScene = () => {
    if (newSceneName.trim()) {
      onAddScene(newSceneName.trim());
      setNewSceneName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Scenes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <PlusCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Add Scene</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Scene</DialogTitle>
              <DialogDescription>
                Give your new animation scene a name.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Scene name"
              className="mt-4"
            />
            <DialogFooter className="mt-4">
              <Button onClick={handleAddScene}>Create Scene</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2">
        {scenes.map((scene) => (
          <Link key={scene.id} href={`/editor/${scene.id}`} className="block">
            <Card
              className={`p-3 hover:bg-gray-50 transition-colors ${scene.id === activeSceneId ? "bg-blue-50 border-blue-200" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {scene.status === "completed" ? (
                    <FileVideo className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2 text-gray-500" />
                  )}
                  <span className="text-sm truncate max-w-36">
                    {scene.name}
                  </span>
                </div>
                {scene.status === "completed" && (
                  <div className="text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                    Ready
                  </div>
                )}
              </div>
              {scene.id === activeSceneId && scene.status !== "pending" && (
                <div className="mt-2 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteScene(scene.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  {scene.status === "completed" && (
                    <Link href={`/preview/${scene.id}`}>
                      <Button size="sm" className="h-7 text-xs">
                        <Film className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          className="w-full"
          disabled={!scenes.some((s) => s.status === "completed")}
        >
          <Film className="mr-2 h-4 w-4" /> Compile All Scenes
        </Button>
      </div>
    </div>
  );
}
