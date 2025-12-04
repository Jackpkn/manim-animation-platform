// components/project/ProjectHeader.tsx
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import React from "react";
// import { UserButton } from "@clerk/nextjs";
const UserButton = ({ afterSignOutUrl }: any) => <div className="w-8 h-8 bg-blue-500 rounded-full"></div>;
import Image from "next/image";

interface ProjectHeaderProps {
  projectId: string;
  onSave: () => void;
}

const ProjectHeader = React.memo(function ProjectHeader({
  projectId,
  onSave,
}: ProjectHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between">
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Manim Logo"
            width={32}
            height={32}
            className="p-1"
          />
        </div>
        <span className="font-semibold text-xl">PromptViz</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Animation Project: {projectId}
      </h1>
      <div className="flex space-x-2 items-center">
        <Button variant="outline" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
});

export default ProjectHeader;
