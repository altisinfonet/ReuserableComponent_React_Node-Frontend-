import axiosInstance from '@/utils/lib/api';

/**
 * BULK ADD images
 */
export const uploadGalleryImages = (
    galleryId: number,
    files: File[],
    imageRank?: number
) => {
    // console.log(files, "sjkdfhjsdfhjsdfsdhfweuioruweir")
    const formData = new FormData();

    if (imageRank) {
        formData.append('imageRank', String(imageRank));
    }

    formData.append('galleryId', String(galleryId));

    files.forEach((file) => {
        formData.append('images', file);
    });

    // console.log(formData, "formdataformdataformdata")

    return axiosInstance.post(`/api/v1/gallery-image/bulk`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * FETCH images by gallery
 */
export const fetchGalleryImages = (galleryId: number) =>
    axiosInstance.get(`/api/v1/gallery-image/gallery/${galleryId}`);

/**
 * SINGLE update (rank / title / replace)
 */
export const updateGalleryImage = (
    galleryId: number,
    payload: {
        id: number;
        imageRank?: number;
        imageTitle?: string;
    },
    file?: File
) => {
    console.log(file, "sdhbjfsdhjfdshfhj")
    const formData = new FormData();

    formData.append('id', String(payload.id));

    if (payload.imageRank)
        formData.append('imageRank', String(payload.imageRank));

    if (payload.imageTitle)
        formData.append('imageTitle', payload.imageTitle);

    if (file) {
        formData.append('images', file); // 🔥 IMPORTANT: images (plural)
    }

    return axiosInstance.patch(
        `/api/v1/gallery-image/${galleryId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
};

/**
 * DELETE
 */
export const deleteGalleryImage = (id: number) =>
    axiosInstance.delete(`/api/v1/gallery-image/${id}`);
