'use client';

import { GripVertical, CheckSquare, Square } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ImageCard({
    image,
    selected,
    onToggleSelect,
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
        <div
            className={`cursor-move rounded-2xl overflow-hidden bg-white shadow-lg  transition
        ${selected ? 'ring-2 ring-purple-500' : ''}`}
            ref={dragHandleProps?.ref}
            {...dragHandleProps}
        // onPointerDown={(e) => e.stopPropagation()}
        // onMouseDown={(e) => e.stopPropagation()}
        // onTouchStart={(e) => e.stopPropagation()}
        // onClick={(e) => {
        //     e.stopPropagation();
        //     onToggleSelect(image.id);
        // }}
        >
            {/* IMAGE */}
            <div className="relative">
                <Image
                    src={image.src}
                    alt={image.imageTitle}
                    className="h-40 w-full object-cover"
                    width={1500}
                    height={1500}
                />

                {/* Rank */}
                <span className="absolute bottom-2 left-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {image.imageRank}
                </span>

                {/* Drag Handle */}
                {/* <div
                   
                    className="absolute top-2 right-2 bg-black/50 rounded-lg p-1 cursor-grab"
                >
                    <GripVertical size={16} className="text-white" />
                </div> */}
            </div>

            {/* CONTENT */}
            <div className="p-3 flex items-center gap-2">
                {/* Title container */}
                <div className="flex-1 min-w-0">
                    {!isEditing ? (
                        <span
                            className="block text-sm font-medium truncate cursor-pointer"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            title={image.imageTitle} // 👌 tooltip on hover
                        >
                            {image.imageTitle || 'Enter image title'}
                        </span>
                    ) : (
                        <input
                            onPointerDown={(e) => e.stopPropagation()}
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

                {/* Checkbox – fixed size, never shrinks */}
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(image.id);
                    }}
                    className="shrink-0 bg-white/90 rounded-lg p-1 shadow cursor-pointer"
                >
                    {selected ? (
                        <CheckSquare className="text-purple-600" size={16} />
                    ) : (
                        <Square className="text-gray-400" size={16} />
                    )}
                </button>
            </div>

        </div>
    );
}
