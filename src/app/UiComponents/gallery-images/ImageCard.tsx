'use client';

import { GripVertical, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ImageCard({
    image,
    onRequestDelete,
    onUpdateTitle,
    dragHandleProps,
}: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(image.imageTitle || '');

    useEffect(() => {
        setTitle(image.imageTitle || '');
    }, [image.imageTitle]);

    const saveTitle = async () => {
        if (title.trim() === image.imageTitle) {
            setIsEditing(false);
            return;
        }
        await onUpdateTitle(image.id, title.trim());
        setIsEditing(false);
    };

    return (
        <div className="rounded-2xl overflow-hidden bg-white shadow-lg  cursor-move"
            ref={dragHandleProps?.ref}
            {...dragHandleProps}
        >
            {/* IMAGE */}
            <div className="relative">
                <img
                    src={image.src}
                    alt={image.imageTitle}
                    className="h-40 w-full object-cover"
                />

                <span className="text-xs text-green-700 bg-green-100  p-1 px-2 font-bold rounded-full absolute bottom-4 left-2 ">
                    {image.imageRank}
                </span>
                {/* Delete */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(image);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // 🔥 CRITICAL
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="text-xs py-1 rounded-full bg-red-100 text-red-600  hover:bg-red-200 transition cursor-pointer  absolute top-2 right-2"
                >
                    <Trash2 className='h-4 text-[15px]  ' />
                </button>
            </div>

            {/* CONTENT */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <div className="flex items-center justify-between gap-2">
                    {!isEditing ? (
                        <span className="text-sm font-medium truncate cursor-pointer"
                            onPointerDown={(e) => e.stopPropagation()} // 🔥 CRITICAL
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                        >
                            {image.imageTitle || 'Enter image title'}
                        </span>
                    ) : (
                        <input
                            onPointerDown={(e) => e.stopPropagation()} // 🔥 CRITICAL
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle();
                                if (e.key === 'Escape') {
                                    setTitle(image.imageTitle || '');
                                    setIsEditing(false);
                                }
                            }}
                            onBlur={saveTitle}
                            className="w-full text-sm px-2 py-1 border rounded-md"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
