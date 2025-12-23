import { motion } from 'framer-motion';
import GalleryCard from './GalleryCard';

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export default function GalleryGrid({ galleries, fetchGalleries, setGalleries }: any) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="
        grid gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
        >
            {galleries.map((g: any) => (
                <GalleryCard key={g.id} gallery={g} fetchGalleries={fetchGalleries} setGalleries={setGalleries} />
            ))}
        </motion.div>
    );
}
