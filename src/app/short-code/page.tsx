/*
 FULLY INTEGRATED SHORTCODE CRUD (FRONTEND)
 -------------------------------------------------
 - Matches NestJS + Prisma backend endpoints
 - GET    /api/v1/short-code
 - POST   /api/v1/short-code
 - PUT    /api/v1/short-code/:slug
 - DELETE /api/v1/short-code/:slug

 Stack:
 - React + TypeScript
 - Tailwind CSS
 - Framer Motion
 - Axios instance
*/

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { _ERROR, _SUCCESS } from '@/utils/AlertToasater/alertToaster';
import axiosInstance from '@/utils/lib/api';

// ---------------- types ----------------
interface Shortcode {
    id: string;
    name: string;
    slug: string;
    content: string;
}

interface FormState {
    name: string;
    content: string;
}

// ---------------- animations ----------------
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

// ---------------- component ----------------
const ShortcodeManager: React.FC = () => {
    const [data, setData] = useState<Shortcode[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState(10);
    const [total, setTotal] = useState(0);

    const [editorOpen, setEditorOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Shortcode | null>(null);
    const [form, setForm] = useState<FormState>({ name: '', content: '' });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const totalPages = Math.ceil(total / rows);

    // ---------------- FETCH LIST ----------------
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                rowsPerPage: String(rows),
                ...(search && { search }),
            });

            const res = await axiosInstance.get(`/api/v1/short-code?${params}`);
            console.log(res?.data)

            setData(res.data?.data?.dataSet ?? []);
            setTotal(res.data?.data?.count ?? 0);
        } catch {
            _ERROR('Failed to load shortcodes');
        } finally {
            setLoading(false);
        }
    }, [page, rows, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ---------------- SEARCH DEBOUNCE ----------------
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchData();
        }, 500);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, fetchData]);

    // ---------------- EDITOR ----------------
    const openEditor = (item?: Shortcode) => {
        if (item) {
            setSelected(item);
            setForm({ name: item.name, content: item.content });
        } else {
            setSelected(null);
            setForm({ name: '', content: '' });
        }
        setEditorOpen(true);
    };

    // ---------------- CREATE / UPDATE ----------------
    const save = async () => {
        if (!form.name.trim()) return _ERROR('Name is required');

        try {
            if (selected) {
                await axiosInstance.put(`/api/v1/short-code/${selected.slug}`, form);
                _SUCCESS('Shortcode updated');
            } else {
                await axiosInstance.post('/api/v1/short-code', form);
                _SUCCESS('Shortcode created');
            }

            setEditorOpen(false);
            fetchData();
        } catch {
            _ERROR('Save failed');
        }
    };

    // ---------------- DELETE ----------------
    const remove = async () => {
        if (!selected) return;

        try {
            await axiosInstance.delete(`/api/v1/short-code/${selected.slug}`);
            _SUCCESS('Shortcode deleted');
            setDeleteOpen(false);
            fetchData();
        } catch {
            _ERROR('Delete failed');
        }
    };

    // ---------------- RENDER ----------------
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Shortcode Manager</h1>
                    <p className="text-sm text-gray-500">Manage reusable shortcodes</p>
                </div>
                <button onClick={() => openEditor()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
                    <Plus size={18} /> New
                </button>
            </motion.div>

            {/* Search */}
            <div className="flex items-center gap-2 border rounded px-3 py-2">
                <Search size={16} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search shortcodes"
                    className="flex-1 outline-none"
                />
                {search && <X onClick={() => setSearch('')} className="cursor-pointer" size={16} />}
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden bg-white">
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center">No shortcodes found</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3">#</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th className="text-right p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{(page - 1) * rows + i + 1}</td>
                                    <td>{item.name}</td>
                                    <td><code>[{item.slug}]</code></td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => openEditor(item)} className="mr-3 text-blue-600"><Edit3 size={16} /></button>
                                        <button onClick={() => { setSelected(item); setDeleteOpen(true); }} className="text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 items-center">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft /></button>
                    <span>{page} / {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight /></button>
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {editorOpen && (
                    <motion.div className="fixed inset-0 bg-black/40 grid place-items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white p-6 rounded-xl w-full max-w-xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                            <h2 className="text-lg font-semibold mb-4">{selected ? 'Edit' : 'Create'} Shortcode</h2>
                            <input className="w-full border p-2 mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" />
                            <textarea className="w-full border p-2 mb-4 font-mono" rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditorOpen(false)}>Cancel</button>
                                <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteOpen && (
                    <motion.div className="fixed inset-0 bg-black/40 grid place-items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white p-6 rounded-xl w-full max-w-md" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                            <h2 className="text-lg font-semibold">Delete shortcode?</h2>
                            <p className="text-sm text-gray-600">This action cannot be undone.</p>
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setDeleteOpen(false)}>Cancel</button>
                                <button onClick={remove} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShortcodeManager;
