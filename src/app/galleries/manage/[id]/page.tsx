'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axiosInstance from '@/utils/lib/api';
import GalleryImageManager from '@/app/UiComponents/gallery-images/GalleryImageManager';
import { _SUCCESS } from '@/utils/AlertToasater/alertToaster';

export default function EditGalleryPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        galleryName: '',
        statusId: 1,
        galleryRank: undefined as number | undefined,
    });


    async function getGalleryById(id: number) {
        try {
            const res = await axiosInstance.get(`/api/v1/galleries/${id}`);
            return res?.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setLoading(true);
                router.push('/galleries/manage');
            }
        }
    }

    async function updateGallery(id: number, payload: any) {
        try {
            const response = axiosInstance.patch(`/api/v1/galleries/${id}`, payload);
            _SUCCESS('Gallery updated');
            return response;
        } catch (error: any) {

        }
    }



    useEffect(() => {
        if (!id) return;

        getGalleryById(Number(id)).then((data) => {
            setForm({
                galleryName: data?.galleryName,
                statusId: data?.statusId,
                galleryRank: data?.galleryRank,
            });
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <GalleryEditLoader />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="mb-6 max-w-2xl mx-auto">
                <h1 className="text-3xl  font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Manage Gallery
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Update gallery details and order
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    await updateGallery(Number(id), form);
                    // router.push('/galleries');
                }}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-5 max-w-2xl mx-auto"
            >
                {/* Gallery Name */}
                <div>
                    <label className="text-sm font-medium text-gray-600">
                        Gallery Name
                    </label>
                    <input
                        value={form?.galleryName}
                        onChange={(e) =>
                            setForm({ ...form, galleryName: e.target.value })
                        }
                        className="mt-1 w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Enter gallery name"
                        required
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="text-sm font-medium text-gray-600">
                        Status
                    </label>
                    <select
                        value={form?.statusId}
                        onChange={(e) =>
                            setForm({ ...form, statusId: Number(e.target.value) })
                        }
                        className="mt-1 w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value={1}>Active</option>
                        <option value={2}>Inactive</option>
                    </select>
                </div>

                {/* Rank */}
                <div>
                    <label className="text-sm font-medium text-gray-600">
                        Display Order (Rank)
                    </label>
                    <input
                        type="text"
                        min={1}
                        value={form.galleryRank}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                galleryRank: Number(e.target.value),
                            })
                        }
                        className="mt-1 w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Changing rank will auto-reorder other galleries
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:scale-[1.02] transition cursor-pointer"
                    >
                        Save Changes
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/galleries')}
                        className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition  cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <GalleryImageManager galleryId={Number(id)} />
        </motion.div>
    );
}



function GalleryEditLoader() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-6"
            >
                {/* Header skeleton */}
                <div className="space-y-3">
                    <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                    <div className="h-4 w-72 rounded-md bg-gray-200 animate-pulse" />
                </div>

                {/* Form card skeleton */}
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                            <div className="h-12 w-full rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                        </div>
                    ))}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <div className="flex-1 h-12 rounded-xl bg-gray-300 animate-pulse" />
                        <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
                    </div>
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        Loading gallery details
                    </motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                    >
                        …
                    </motion.span>
                </div>
            </motion.div>
        </div>
    );
}