'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Listbox } from '@headlessui/react';
import {
    Eye,
    Edit3,
    Columns,
    Save,
    Code,
    Loader2,
    ChevronDown,
} from 'lucide-react';
import axiosInstance from '@/utils/lib/api';
import parser from 'html-react-parser';
import { parseShortcodes } from '@/utils/shortcodeParser';
import shortcodeRegistry from '@/utils/shortcode';

const CKEditor = dynamic(
    () => import('@ckeditor/ckeditor5-react').then(m => m.CKEditor),
    { ssr: false }
);
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

type ViewMode = 'editor' | 'preview' | 'split';

type Country = {
    id: number;
    name: string;
    language: string;
};


type Translation = {
    language: string;
    content: string;
    page_name: string;
};

type PageResponse = {
    id: number;
    name: string;
    slug: string;
    translations: {
        language: string;
        content: string;
        page_name: string;
    }[];
};

const viewModes: {
    mode: ViewMode;
    Icon: React.ComponentType<{ size?: number }>;
}[] = [
        { mode: 'editor', Icon: Edit3 },
        { mode: 'split', Icon: Columns },
        { mode: 'preview', Icon: Eye },
    ];

export default function CreateEditCMSPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const isViewMode = searchParams.get('view') === 'true';
    const isEditMode = Boolean(slug) && !isViewMode;
    // const isEditMode = Boolean(slug);

    const [translations, setTranslations] = useState<Translation[]>([]);
    const [pageId, setPageId] = useState<number | null>(null);
    const [pageName, setPageName] = useState('');
    const [content, setContent] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('editor');
    const [loading, setLoading] = useState(false);

    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    const [showShortcodes, setShowShortcodes] = useState(false);

    // 🔒 store original EN content to detect changes
    const originalContentRef = useRef<string>('');

    /* --------------------------------
       Load Countries
    -------------------------------- */
    useEffect(() => {
        axiosInstance.get('/api/v1/countries').then(res => {
            setCountries(res.data);
            const en = res.data.find((c: Country) => c.language === 'EN');
            setSelectedCountry(en);
        });
    }, []);

    /* --------------------------------
       Load Page (EDIT MODE)
    -------------------------------- */
    useEffect(() => {
        if (!slug) return;

        setLoading(true);

        axiosInstance
            .get(`/api/v1/page/${slug}`)
            .then(res => {
                const page: PageResponse = res.data;

                setPageId(page.id);
                setPageName(page.name);
                setTranslations(page.translations);

                const en = page.translations.find(t => t.language === 'EN');
                const enContent = en?.content ?? '';

                setContent(enContent);
                originalContentRef.current = enContent;
            })
            .finally(() => setLoading(false));
    }, [slug]);

    /* --------------------------------
       SAVE (CREATE / UPDATE)
    -------------------------------- */
    const savePage = async () => {
        // if (!pageName || !content || !selectedCountry) return;

        try {
            setLoading(true);

            // CREATE MODE
            if (!isEditMode) {
                await axiosInstance.post('/api/v1/page', {
                    name: pageName,
                    content,
                    countryId: selectedCountry?.id,
                });

                router.push('/page');
                return;
            }

            // EDIT MODE
            const payload: any = { name: pageName };

            // send content ONLY if changed
            if (content !== originalContentRef.current) {
                payload.content = content;
            }

            await axiosInstance.put(`/api/v1/page/${slug}`, payload);

            originalContentRef.current = content;
            alert('Page updated successfully ✅');
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------------
       UI
    -------------------------------- */

    /* --------------------------------
      Change language (VIEW MODE)
   -------------------------------- */
    const handleLanguageChange = (country: Country) => {
        setSelectedCountry(country);

        const translation = translations?.find(
            t => t?.language === country?.language
        );

        console.log(translations, "translationtranslation")

        setContent(translation?.content || '');
        setPageName(translation?.page_name || '');
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">
                        {isViewMode ? pageName : isEditMode ? 'Edit Page' : 'Create Page'}
                    </h1>
                    {!isViewMode && (
                        <p className="text-sm text-gray-500">
                            English is the source · Other languages auto-sync
                        </p>
                    )}
                </div>

                {!isViewMode && (
                    <button
                        onClick={savePage}
                        disabled={loading}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        Save
                    </button>
                )}
            </div>



            {/* NAME + LANGUAGE */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-5 rounded-xl">
                    <label className="text-sm font-medium">Page Name</label>
                    <input
                        value={pageName}
                        onChange={e => setPageName(e.target.value)}
                        className="mt-2 w-full border rounded-lg px-4 py-2"
                    />
                </div>
                {isViewMode && (
                    <div className="max-w-xs">
                        <Listbox value={selectedCountry} onChange={handleLanguageChange}>
                            <Listbox.Button className="w-full border px-4 py-2 rounded-lg flex justify-between">
                                {selectedCountry?.name}
                                <ChevronDown size={16} />
                            </Listbox.Button>

                            <Listbox.Options className="mt-1 bg-white border rounded-lg shadow">
                                {countries.map(c => (
                                    <Listbox.Option
                                        key={c.id}
                                        value={c}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        {c.name}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>
                    </div>
                )}
            </div>



            {/* LANGUAGE SELECT (VIEW MODE ONLY) */}


            {
                !isViewMode && (
                    <>
                        {/* TOOLBAR */}
                        <div className="flex gap-3">
                            {viewModes.map(({ mode, Icon }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`p-2 border rounded-lg transition ${viewMode === mode
                                        ? 'bg-black text-white'
                                        : 'bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={18} />
                                </button>
                            ))}


                            <button
                                onClick={() => setShowShortcodes(true)}
                                className="ml-auto flex gap-2 items-center border px-4 py-2 rounded-lg"
                            >
                                <Code size={16} /> Shortcodes
                            </button>
                        </div>

                        {/* EDITOR */}
                        <div
                            className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-2' : ''
                                }`}
                        >
                            {viewMode !== 'preview' && (
                                <div className="bg-white p-4 rounded-xl">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={content}
                                        onChange={(_, editor) => setContent(editor.getData())}
                                    />
                                </div>
                            )}

                            {viewMode !== 'editor' && (
                                <div className="bg-white p-6 rounded-xl prose max-w-none">
                                    {content
                                        ? parseShortcodes(parser(content), shortcodeRegistry)
                                        : 'Preview'}
                                </div>
                            )}
                        </div>
                    </>
                )
            }

            {/* PURE VIEW */}
            {isViewMode && (
                <div className="bg-white p-6 rounded-xl prose max-w-none">
                    {parseShortcodes(parser(content), shortcodeRegistry)}
                </div>
            )}



            {/* SHORTCODE MODAL */}
            <AnimatePresence>
                {showShortcodes && (
                    <Dialog
                        open={showShortcodes}
                        onClose={() => setShowShortcodes(false)}
                        className="relative z-50"
                    >
                        <div className="fixed inset-0 bg-black/40" />
                        <Dialog.Panel className="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-3xl bg-white p-6 rounded-xl">
                            <Dialog.Title className="font-semibold mb-4">
                                Insert Shortcode
                            </Dialog.Title>

                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(shortcodeRegistry).map(sc => (
                                    <motion.div
                                        key={sc}
                                        whileHover={{ scale: 1.03 }}
                                        onClick={() => {
                                            setContent(prev => `${prev}\n\n[${sc}]\n\n`);
                                            setShowShortcodes(false);
                                        }}
                                        className="border rounded-lg p-3 cursor-pointer"
                                    >
                                        [{sc}]
                                    </motion.div>
                                ))}
                            </div>
                        </Dialog.Panel>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
