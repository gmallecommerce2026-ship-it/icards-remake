"use client";

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';

interface ImageUploadFieldProps {
    value: string | File | null;
    onFileSelect: (file: File) => void;
    onFileClear?: () => void;
}

export default function ImageUploadField({ value, onFileSelect, onFileClear }: ImageUploadFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(value as string);
        }
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        event.target.value = ''; // Reset để chọn lại cùng file
    };

    return (
        <div className="flex items-center gap-4 p-3 border border-line rounded-xl bg-porcelain/50">
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-line bg-white flex items-center justify-center">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="text-muted w-6 h-6" />
                )}
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg border border-line bg-white text-sm font-medium text-ink hover:border-lacquer hover:text-lacquer transition-colors"
                >
                    <UploadCloud className="w-4 h-4" />
                    Chọn ảnh
                </button>
                
                {onFileClear && preview && (
                    <button 
                        type="button"
                        onClick={onFileClear}
                        className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa ảnh
                    </button>
                )}
            </div>
        </div>
    );
}