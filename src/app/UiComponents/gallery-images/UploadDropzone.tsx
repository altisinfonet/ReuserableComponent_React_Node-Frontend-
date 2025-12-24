'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

type PreviewFile = {
    id: string;
    file: File;
    preview: string;
};

function SortablePreview({
    item,
    onRemove,
}: {
    item: PreviewFile;
    onRemove: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners} // 👈 whole card draggable
            className="relative group cursor-move"
        >
            <img
                src={item.preview}
                className="h-28 w-full object-cover rounded-xl border"
                alt="preview"
            />

            {/* ❌ REMOVE BUTTON */}
            <button
                onPointerDown={(e) => e.stopPropagation()} // 🔥 CRITICAL
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation(); // 🔥 THIS WAS MISSING
                    onRemove(item.id);
                }}
                className="
                  absolute top-2 right-2
                  bg-red-500 text-white
                  rounded-full p-1
                  opacity-100
                  transition z-20 cursor-pointer
                "
            >
                <X size={14} />
            </button>
        </div>
    );
}


export default function UploadDropzone({
    onFiles,
}: {
    onFiles: (files: File[]) => Promise<void> | void;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [items, setItems] = useState<PreviewFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    /* ---------------------------
       Helpers
    --------------------------- */
    const addFiles = (files: File[]) => {
        const newItems = files
            .filter((f) => f.type.startsWith('image/'))
            .map((file) => ({
                id: new Date().getTime() + file.name,
                file,
                preview: URL.createObjectURL(file),
            }));

        setItems((prev) => [...prev, ...newItems]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    /* ---------------------------
       Drag events
    --------------------------- */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItems((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    /* ---------------------------
       Upload
    --------------------------- */
    const handleUpload = async () => {
        if (!items.length) return;
        setUploading(true);
        try {
            await onFiles(items.map((i) => i.file));
            // clear previews after success
            items.forEach((i) => URL.revokeObjectURL(i.preview));
            setItems([]);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            items.forEach((i) => URL.revokeObjectURL(i.preview));
        };
    }, [items]);

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  rounded-3xl p-6 cursor-pointer
                  border-2 border-dashed transition
                  
                  ${isDragging
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                    }
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                        e.target.files && addFiles(Array.from(e.target.files))
                    }
                />

                <p className="text-center font-semibold text-purple-700">
                    {items.length
                        ? 'Reorder or remove images'
                        : 'Drop images here or click to upload'}
                </p>
                <p className="text-xs text-center text-gray-500 mt-1">
                    PNG, JPG, WEBP supported
                </p>

                {/* Preview grid */}
                {items.length > 0 && (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext
                            items={items.map((i) => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                                {items.map((item) => (
                                    <SortablePreview
                                        key={item.id}
                                        item={item}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </motion.div>

            {/* Upload button */}
            {items.length > 0 && (
                <button
                    disabled={uploading}
                    onClick={handleUpload}
                    className="
                      w-full py-3 rounded-xl
                      bg-black text-white font-medium
                      hover:bg-gray-800
                      disabled:opacity-60 cursor-pointer
                    "
                >
                    {uploading ? 'Uploading…' : `Upload ${items.length} Images`}
                </button>
            )}
        </div>
    );
}
