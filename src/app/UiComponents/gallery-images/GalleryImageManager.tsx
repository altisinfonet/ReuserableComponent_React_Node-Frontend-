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
import { Trash2 } from 'lucide-react';

/* ------------------------------------
   SORTABLE ITEM
------------------------------------ */
function SortableImage({ image, onDelete, onUpdateTitle, setDeleteTarget }: any) {
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
            <ImageCard
                image={image}
                onDelete={onDelete}
                onRequestDelete={(image: any) => setDeleteTarget(image)}
                onUpdateTitle={onUpdateTitle}
                dragHandleProps={{
                    ref: setActivatorNodeRef,
                    ...listeners,
                    ...attributes,
                }}
            />
        </div>
    );
}


export default function GalleryImageManager({ galleryId }: { galleryId: number }) {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // prevents concurrent save calls
    const saveLock = useRef(false);

    const loadImages = async () => {
        const res = await fetchGalleryImages(galleryId);
        setImages(
            res.data.sort((a: any, b: any) => a.imageRank - b.imageRank)
        );
        setLoading(false);
    };

    useEffect(() => {
        loadImages();
    }, [galleryId]);

    const reorderGalleryImages = async (
        galleryId: number,
        orders: { id: number; imageRank: number }[],
    ) => {
        return axiosInstance.patch(
            `/api/v1/gallery-image/${galleryId}/reorder`,
            { orders }
        );
    };

    /* ------------------------------------
       DRAG END → REORDER + SAVE
    ------------------------------------ */
    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;
        if (saveLock.current) return;

        let reordered: any[] = [];

        setImages((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            reordered = arrayMove(items, oldIndex, newIndex);
            return reordered;
        });

        // 🔐 lock saving
        saveLock.current = true;
        setIsSaving(true);

        try {
            // 🔥 SINGLE DRAG → SINGLE BATCH UPDATE
            await reorderGalleryImages(
                galleryId,
                reordered.map((img, index) => ({
                    id: img.id,
                    imageRank: index + 1,
                }))
            );
            loadImages()
        } finally {
            saveLock.current = false;
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="mt-10 space-y-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Gallery Images
                </h2>

                {/* Upload */}
                <UploadDropzone
                    onFiles={async (files) => {
                        if (files?.length > 0) {
                            await uploadGalleryImages(galleryId, files);
                            loadImages();
                        }
                    }}
                />

                {isSaving && (
                    <p className="text-xs text-purple-500 animate-pulse">
                        Saving order…
                    </p>
                )}

                {loading ? (
                    <p className="text-gray-400">Loading images…</p>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext
                            items={images.map((i) => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                                {images.map((img) => (
                                    <SortableImage
                                        key={img.id}
                                        image={img}
                                        setDeleteTarget={setDeleteTarget}
                                        onDelete={async (id: number) => {
                                            await deleteGalleryImage(id);
                                            loadImages();
                                        }}
                                        onUpdateTitle={async (id: number, title: string) => {
                                            // optimistic update
                                            setImages((prev) =>
                                                prev.map((img) =>
                                                    img.id === id ? { ...img, imageTitle: title } : img
                                                )
                                            );

                                            await updateGalleryImage(galleryId, {
                                                id,
                                                imageTitle: title,
                                            });
                                        }}
                                    />

                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <DeleteImageConfirmModal
                open={!!deleteTarget}
                image={deleteTarget}
                loading={isDeleting}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={async () => {
                    if (!deleteTarget) return;

                    setIsDeleting(true);
                    try {
                        await deleteGalleryImage(deleteTarget.id);
                        loadImages();
                        setImages((prev) =>
                            prev.filter((img) => img.id !== deleteTarget.id)
                        );
                        setDeleteTarget(null);
                    } finally {
                        setIsDeleting(false);
                    }
                }}
            />
        </>

    );
}






function DeleteImageConfirmModal({
    open,
    image,
    loading,
    onCancel,
    onConfirm,
}: any) {
    return (
        <AnimatePresence>
            {open && (
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
                        transition={{ type: 'spring', damping: 18 }}
                        className="bg-white rounded-xl p-5 w-[90%] max-w-sm text-center shadow-xl"
                    >
                        <Trash2 className="mx-auto text-red-500 mb-2" size={22} />

                        <p className="text-sm font-semibold text-gray-800">
                            Delete this image?
                        </p>

                        <p className="text-xs text-gray-500 mt-1 truncate">
                            {image?.imageTitle || 'Untitled image'}
                        </p>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                            >
                                {loading ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
