'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DriveLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (link: string) => Promise<void>;
    onValidate: (link: string) => Promise<{ accessible: boolean; message: string; status: number } | null>;
    link: string;
    onLinkChange: (link: string) => void;
    isValidating: boolean;
    isUpdating: boolean;
    updated: boolean;
    isDirty: boolean;
    error: string;
    validationResult: { accessible: boolean; message: string; status: number } | null;
}

export default function DriveLinkModal({
    isOpen,
    onClose,
    onSubmit,
    onValidate,
    link,
    onLinkChange,
    isValidating,
    isUpdating,
    updated,
    isDirty,
    error,
    validationResult
}: DriveLinkModalProps) {
    if (!isOpen) return null;

    const handleValidateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!link.trim()) return;

        const validationResult = await onValidate(link);
        if (validationResult && validationResult.accessible) {
            await onSubmit(link);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Drive Link</h2>

                <form onSubmit={handleValidateAndSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="drive_link" className="mb-2">Google Drive Link</Label>
                        <Input
                            id="drive_link"
                            type="url"
                            value={link}
                            onChange={(e) => onLinkChange(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Validation Result */}
                    {validationResult && (
                        <div className={`mb-4 p-3 rounded-md ${validationResult.accessible
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}>
                            <p className={`text-sm ${validationResult.accessible
                                ? 'text-green-700'
                                : 'text-red-700'
                                }`}>
                                {validationResult.accessible ? '✓ ' : '✗ '}
                                {validationResult.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                HTTP Status: {validationResult.status}
                            </p>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            Please make sure your drive folder is set to &quot;Anyone with the link can view&quot; permissions.
                        </p>
                    </div>

                    {error && !validationResult && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 transition-colors disabled:opacity-50"
                            disabled={
                                isUpdating ||
                                updated ||
                                !isDirty ||
                                isValidating
                            }
                        >
                            {isValidating ? 'Validating...' :
                                isUpdating ? 'Saving...' :
                                    updated ? 'Saved!' : 'Save Link'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
