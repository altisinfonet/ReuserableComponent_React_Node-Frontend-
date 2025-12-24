import { motion } from 'framer-motion';
import GalleryCard from './GalleryCard';

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

export default function GalleryGrid({
    galleries,
    view,
    fetchGalleries,
    setGalleries,
}: any) {
    return (
        <motion.div
            layout
            variants={container}
            initial="hidden"
            animate="show"
            className={
                view === 'grid'
                    ? `
            grid gap-6
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `
                    : `
            flex flex-col gap-4
          `
            }
        >
            {galleries.map((g: any) => (
                <GalleryCard
                    key={g.id}
                    gallery={g}
                    view={view}
                    fetchGalleries={fetchGalleries}
                    setGalleries={setGalleries}
                />
            ))}
        </motion.div>
    );
}
