'use client';
import GalleryImageManager from '@/app/UiComponents/gallery-images/GalleryImageManager';
import GalleryForm from '@/app/UiComponents/GalleryForm';
import axiosInstance from '@/utils/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewGallery() {
    const router = useRouter();
    const [galleryId, setGalleryId] = useState(0);
    async function createGallery(payload: any) {
        return axiosInstance.post('/api/v1/galleries', payload);
    }


    return (
        <>

            <GalleryForm
                onSubmit={async (data: any) => {
                    await createGallery(data).then((res) => router.push(`/galleries/manage/${res?.data?.id}`));
                }}
            />

            {/* <div className="mt-8 max-w-7xl mx-auto">
                {galleryId !== 0 && <GalleryImageManager

                    galleryId={Number(galleryId)}

                />}
            </div> */}
        </>
    );
}
