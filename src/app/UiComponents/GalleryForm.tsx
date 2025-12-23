'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GalleryForm({
    initialData,
    onSubmit,
}: any) {
    const [form, setForm] = useState(
        initialData || { galleryName: '', statusId: 1 }
    );

    return (
        <motion.form
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(form);
            }}
            className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow"
        >
            <h2 className="text-2xl font-bold mb-4">
                {initialData ? 'Edit Gallery' : 'Create Gallery'}
            </h2>

            <input
                placeholder="Gallery name"
                className="w-full p-3 border rounded-xl mb-4"
                value={form.galleryName}
                onChange={(e) =>
                    setForm({ ...form, galleryName: e.target.value })
                }
            />

            <select
                className="w-full p-3 border rounded-xl mb-4"
                value={form.statusId}
                onChange={(e) =>
                    setForm({ ...form, statusId: Number(e.target.value) })
                }
            >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
            </select>

            <button className="w-full py-3 rounded-xl bg-black text-white hover:scale-105 transition cursor-pointer">
                Save
            </button>
        </motion.form>
    );
}
