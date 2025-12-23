'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GalleryProps {
    columns?: number;        // number of columns (desktop)
    gap?: number;            // gap between images
}

const DUMMY_IMAGES: string[] = [
    'https://picsum.photos/id/1011/800/600',
    'https://picsum.photos/id/1015/800/600',
    'https://picsum.photos/id/1025/800/600',
    'https://picsum.photos/id/1035/800/600',
    'https://picsum.photos/id/1041/800/600',
    'https://picsum.photos/id/1050/800/600',
];

const GalleryShortcode: React.FC<GalleryProps> = ({
    columns = 3,
    gap = 16,
}) => {
    const [activeImage, setActiveImage] = useState<string | null>(null);

    return (
        <>
            {/* Gallery Grid */}
            <div
                className="grid"
                style={{
                    gap,
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
            >
                {DUMMY_IMAGES.map((src, index) => (
                    <motion.div
                        key={index}
                        className="relative cursor-pointer overflow-hidden rounded-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveImage(src)}
                    >
                        <motion.img
                            src={src}
                            alt={`Gallery image ${index + 1}`}
                            className="h-48 w-full object-cover"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />

                        {/* Overlay */}
                        <motion.div
                            className="absolute inset-0 bg-black/30 opacity-0 flex items-center justify-center text-white font-medium"
                            whileHover={{ opacity: 1 }}
                        >
                            View
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {activeImage && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveImage(null)}
                    >
                        <motion.div
                            className="relative max-w-4xl w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow"
                                onClick={() => setActiveImage(null)}
                            >
                                <X size={18} />
                            </button>

                            <img
                                src={activeImage}
                                alt="Preview"
                                className="w-full max-h-[80vh] object-contain rounded-xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GalleryShortcode;
