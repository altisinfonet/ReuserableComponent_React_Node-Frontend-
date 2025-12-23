'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Pencil,
    Globe,
    Loader2,
    Eye,
} from 'lucide-react';
import axios from '@/utils/lib/api';
import { useRouter } from 'next/navigation';

type Page = {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    translations: {
        id: number;
        language: string;
    }[];
};

export default function PageListing() {
    const router = useRouter();
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    /* --------------------------------
       Fetch Pages
    -------------------------------- */
    const fetchPages = async () => {
        setLoading(true);
        const res = await axios.get('/api/v1/page');
        setPages(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPages();
    }, []);

    /* --------------------------------
       Update Page Name
    -------------------------------- */
    const updatePage = async (slug: string) => {
        await axios.put(`/api/v1/page/${slug}`, { name: editName });
        setEditingSlug(null);
        fetchPages();
    };

    /* --------------------------------
       Delete Page
    -------------------------------- */
    const deletePage = async (slug: string) => {
        if (!confirm('Delete this page permanently?')) return;
        await axios.delete(`/api/v1/page/${slug}`);
        fetchPages();
    };

    /* --------------------------------
       UI
    -------------------------------- */
    return (
        <div className="max-w-7xl mx-auto py-8 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">CMS Pages</h1>
                    <p className="text-sm text-gray-500">
                        Manage all pages & translations
                    </p>
                </div>

                <button
                    onClick={() => router.push('/page/create-edit-page')}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:scale-[1.03] transition"
                >
                    <Plus size={18} /> New Page
                </button>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <div className="grid gap-3">
                    <AnimatePresence>
                        {pages.map((page) => (
                            <motion.div
                                key={page.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-xl border p-4 flex items-center justify-between hover:shadow-sm transition"
                            >
                                {/* LEFT */}
                                <div className="flex-1">
                                    {editingSlug === page.slug ? (
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={() => updatePage(page.slug)}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' && updatePage(page.slug)
                                            }
                                            autoFocus
                                            className="border px-3 py-1 rounded-lg w-full"
                                        />
                                    ) : (
                                        <>
                                            <h3 className="font-medium">{page.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                /{page.slug}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* TRANSLATIONS */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Globe size={16} />
                                    {page.translations.length} langs
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-3 ml-4">
                                    <button
                                        onClick={() => router.push('/page/create-edit-page?slug=' + page.slug + '&view=true')}
                                        className="hover:text-black text-gray-500"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => router.push('/page/create-edit-page?slug=' + page.slug)}
                                        className="hover:text-black text-gray-500"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() => deletePage(page.slug)}
                                        className="hover:text-red-600 text-gray-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
