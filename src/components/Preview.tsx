interface PreviewProps {
    videoUrl?: string;
    onDownload?: () => void;
    isExecuting?: boolean;
    error?: string;
}

export default function Preview({ videoUrl, onDownload, isExecuting, error }: PreviewProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preview
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={onDownload}
                        disabled={!videoUrl || isExecuting}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Download
                    </button>
                </div>
            </div>
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center">
                {isExecuting ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Generating animation...
                        </p>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                        {error}
                    </div>
                ) : videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-full rounded-md"
                    />
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        Animation preview will appear here
                    </p>
                )}
            </div>
        </div>
    );
} 