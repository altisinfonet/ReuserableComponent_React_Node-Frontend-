'use client';

import StatusBadge from './StatusBadge';
import Link from 'next/link';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/utils/lib/api';

const card = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9 },
};

export default function GalleryCard({
    gallery,
    fetchGalleries,
    setGalleries,
}: any) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const hasImages = gallery?.galleryImages?.length > 0;

    const deleteGallery = async (id: number) => {
        return axiosInstance.delete(`/api/v1/galleries/${id}`);
    };

    const handleDelete = async () => {
        if (hasImages) return; // 🔒 HARD STOP (safety)

        try {
            setLoading(true);
            await deleteGallery(gallery.id);
            setOpen(false);
            fetchGalleries().then(setGalleries);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    variants={card}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="
                      relative overflow-hidden
                      rounded-3xl
                      bg-white/70 backdrop-blur-xl
                      border border-white/40
                      shadow-lg hover:shadow-2xl
                      p-5
                    "
                >
                    {/* Gradient glow */}
                    <div
                        className="
                          absolute inset-0
                          opacity-0 hover:opacity-100
                          transition duration-300
                          pointer-events-none
                          bg-gradient-to-br
                          from-pink-400/20
                          via-purple-400/20
                          to-indigo-400/20
                        "
                    />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <h3 className="font-semibold text-lg leading-tight">
                                {gallery.galleryName}
                            </h3>
                            <StatusBadge status={gallery.status.statusTitle} />
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-5">
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                Rank #{gallery.galleryRank}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                Images: {gallery.galleryImages?.length || 0}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/galleries/${gallery.id}/edit`}
                                className="
                                  flex-1 text-center
                                  text-sm font-medium
                                  px-4 py-2 rounded-xl
                                  bg-gray-900 text-white
                                  hover:bg-gray-800
                                  transition
                                "
                            >
                                Edit
                            </Link>

                            <button
                                onClick={() => setOpen(true)}
                                className="
                                  px-4 py-2 rounded-xl
                                  bg-red-100 text-red-600
                                  hover:bg-red-200
                                  transition cursor-pointer
                                "
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                open={open}
                loading={loading}
                hasImages={hasImages}
                imageCount={gallery.galleryImages?.length || 0}
                onCancel={() => setOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

function DeleteConfirmModal({
    open,
    loading,
    hasImages,
    imageCount,
    onCancel,
    onConfirm,
}: any) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="
                          fixed z-50 inset-0
                          flex items-center justify-center
                          px-4
                        "
                    >
                        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                            <div className="flex items-center gap-2">
                                {hasImages && (
                                    <AlertTriangle className="text-orange-500" size={20} />
                                )}
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {hasImages
                                        ? 'Cannot delete gallery'
                                        : 'Delete gallery?'}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mt-3">
                                {hasImages ? (
                                    <>
                                        This gallery contains{' '}
                                        <strong>{imageCount}</strong> image
                                        {imageCount > 1 ? 's' : ''}.
                                        <br />
                                        Please remove all images before deleting
                                        the gallery.
                                    </>
                                ) : (
                                    'This action cannot be undone. The gallery will be permanently removed.'
                                )}
                            </p>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="
                                      px-4 py-2 rounded-lg
                                      text-sm font-medium
                                      bg-gray-100 hover:bg-gray-200 cursor-pointer
                                    "
                                >
                                    Close
                                </button>

                                {!hasImages && (
                                    <button
                                        onClick={onConfirm}
                                        disabled={loading}
                                        className="
                                          px-4 py-2 rounded-lg
                                          text-sm font-medium
                                          bg-red-600 text-white
                                          hover:bg-red-700
                                          disabled:opacity-60 cursor-pointer
                                        "
                                    >
                                        {loading ? 'Deleting…' : 'Delete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
