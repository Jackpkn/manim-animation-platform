// components/project/ProjectHeader.tsx
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import React from "react"; // Import React

interface ProjectHeaderProps {
  projectId: string;
  onSave: () => void;
}

const ProjectHeader = React.memo(function ProjectHeader({
  projectId,
  onSave,
}: ProjectHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Animation Project: {projectId}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Project
          </Button>
        </div>
      </div>
    </header>
  );
});

export default ProjectHeader;
