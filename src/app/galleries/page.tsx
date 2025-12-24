'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GalleryGrid from '../UiComponents/GalleryGrid';
import axiosInstance from '@/utils/lib/api';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';

export default function GalleriesPage() {
    const [galleries, setGalleries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>('grid');

    async function fetchGalleries() {
        const res = await axiosInstance.get(`/api/v1/galleries`);
        return res.data;
    }

    useEffect(() => {
        fetchGalleries()
            .then(setGalleries)
            .finally(() => setLoading(false));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="px-4 sm:px-6 py-8 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        Galleries
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your visual collections & ordering
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="relative flex rounded-2xl bg-gray-100 p-1 shadow-inner">
                        {/* Animated indicator */}
                        <motion.div
                            layout
                            layoutId="view-toggle-indicator"
                            transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 35,
                            }}
                            className={` absolute top-1 bottom-1 w-1/2 rounded-xl bg-white shadow ${view === 'grid' ? 'left-1' : 'left-1/2'} `}
                        />

                        {/* Grid Button */}
                        <button

                            onClick={() => setView('grid')}
                            className={` cursor-pointer  relative z-10 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'grid' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'} `}
                        >
                            Grid
                        </button>

                        {/* List Button */}
                        <button
                            onClick={() => setView('list')}
                            className={` cursor-pointer relative z-10 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'list' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            List
                        </button>
                    </div>


                    <Link
                        href="/galleries/manage"
                        className=" inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg hover:scale-[1.04] hover:shadow-xl transition"
                    >
                        + New Gallery
                    </Link>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center text-gray-400 py-20 animate-pulse">
                    Loading galleries…
                </div>
            ) : galleries.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-lg font-medium text-gray-500">
                        No galleries yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Create your first gallery to get started ✨
                    </p>
                </div>
            ) : (
                <GalleryGrid
                    galleries={galleries}
                    view={view}
                    fetchGalleries={fetchGalleries}
                    setGalleries={setGalleries}
                />
            )}
        </motion.div>
    );
}
