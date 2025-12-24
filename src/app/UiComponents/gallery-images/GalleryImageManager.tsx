'use client';

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

import UploadDropzone from './UploadDropzone';
import ImageCard from './ImageCard';
import {
    deleteGalleryImage,
    fetchGalleryImages,
    updateGalleryImage,
    uploadGalleryImages,
} from '@/utils/lib/galleryImageApi';

import axiosInstance from '@/utils/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Trash2 } from 'lucide-react';
import { _SUCCESS } from '@/utils/AlertToasater/alertToaster';

/* ------------------------------------
   SORTABLE WRAPPER
------------------------------------ */
function SortableImage({ image, children }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({
                dragHandleProps: {
                    ref: setActivatorNodeRef,
                    ...listeners,
                    ...attributes,
                },
            })}
        </div>
    );
}

export default function GalleryImageManager({ galleryId }: { galleryId: number }) {
    const [images, setImages] = useState<any[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const saveLock = useRef(false);
    const [isGridView, setIsGridView] = useState(true);

    const loadImages = async () => {
        const res = await fetchGalleryImages(galleryId);
        setImages(res.data.sort((a: any, b: any) => a.imageRank - b.imageRank));
        setLoading(false);
    };

    useEffect(() => {
        loadImages();
    }, [galleryId]);

    /* ------------------------------------
       DRAG END → REORDER
    ------------------------------------ */
    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || saveLock.current) return;

        let reordered: any[] = [];

        setImages((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            reordered = arrayMove(items, oldIndex, newIndex);
            return reordered;
        });

        saveLock.current = true;
        try {
            await axiosInstance.patch(`/api/v1/gallery-image/${galleryId}/reorder`, {
                orders: reordered.map((img, index) => ({
                    id: img.id,
                    imageRank: index + 1,
                })),
            });
            loadImages();
        } finally {
            saveLock.current = false;
        }
    };

    /* ------------------------------------
       BULK DELETE
    ------------------------------------ */
    const confirmBulkDelete = async () => {

        console.log(selected, "imageIDS")

        try {
            const response = await axiosInstance.delete(`/api/v1/gallery-image/bulk/${galleryId}`, {
                data: { ids: selected },
            });
            if (response?.data?.success) {
                _SUCCESS('Images deleted');
                loadImages();
                setSelected([]);
                setIsDeleting(false);
            }
            console.log(response, "response")
        } catch (error: any) {

        }
    };

    return (
        <>
            <div className="mt-10 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Gallery Images
                    </h2>

                    <div className="flex items-center justify-between gap-2">
                        {/* View Toggle */}
                        <div className="relative flex items-center bg-gray-100 rounded-xl p-1">
                            {/* Animated background */}
                            <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="absolute top-1 bottom-1 w-10 rounded-lg bg-white shadow"
                                style={{
                                    left: isGridView ? '4px' : '44px',
                                }}
                            />

                            {/* Grid Button */}
                            <button
                                onClick={() => setIsGridView(true)}
                                className={`relative z-10 w-10 h-9 cursor-pointer flex items-center justify-center rounded-lg transition ${isGridView ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                aria-label="Grid view"
                            >
                                <LayoutGrid size={18} />
                            </button>

                            {/* List Button */}
                            <button
                                onClick={() => setIsGridView(false)}
                                className={`relative z-10 w-10 h-9 flex items-center justify-center rounded-lg transition cursor-pointer  ${!isGridView ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                                aria-label="List view"
                            >
                                <List size={18} />
                            </button>
                        </div>
                        {selected.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                onClick={() => setIsDeleting(true)}
                                className="flex items-center gap-2 px-4 py-3 text-sm rounded-xl bg-red-600 text-white cursor-pointer"
                            >
                                <Trash2 size={16} />
                                Delete {selected.length}
                            </motion.button>
                        )}
                    </div>

                </div>

                <UploadDropzone
                    onFiles={async (files) => {
                        if (files.length > 0) {
                            await uploadGalleryImages(galleryId, files);
                            loadImages();
                        }
                    }}
                />

                {loading ? (
                    <p className="text-gray-400">Loading images…</p>
                ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext
                            items={images.map((i) => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className={`grid gap-4 ${isGridView ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}>
                                {images.map((img) => (
                                    <SortableImage key={img.id} image={img}>
                                        {({ dragHandleProps }: any) => (
                                            <ImageCard
                                                image={img}
                                                selected={selected.includes(img.id)}
                                                onToggleSelect={(id: number) =>
                                                    setSelected((prev) =>
                                                        prev.includes(id)
                                                            ? prev.filter((x) => x !== id)
                                                            : [...prev, id]
                                                    )
                                                }
                                                dragHandleProps={dragHandleProps}
                                                onUpdateTitle={async (id: number, title: string) => {
                                                    setImages((prev) =>
                                                        prev.map((i) =>
                                                            i.id === id ? { ...i, imageTitle: title } : i
                                                        )
                                                    );
                                                    await updateGalleryImage(galleryId, { id, imageTitle: title });
                                                }}
                                            />
                                        )}
                                    </SortableImage>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Bulk Delete Modal */}
            <AnimatePresence>
                {isDeleting && selected.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 10 }}
                            className="bg-white rounded-xl p-6 w-[90%] max-w-xs text-center shadow-xl"
                        >
                            <Trash2 className="mx-auto text-red-500 mb-3" size={24} />

                            <p className="text-sm font-semibold text-gray-800">
                                Delete selected images?
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                This will permanently remove {selected.length} image
                                {selected.length > 1 ? 's' : ''}. This action cannot be undone.
                            </p>

                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    className="flex-1 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                >
                                    Keep them
                                </button>

                                <button
                                    onClick={confirmBulkDelete}
                                    // disabled={isDeleting}
                                    className="flex-1 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                >
                                    {`Delete forever (${selected.length})`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
