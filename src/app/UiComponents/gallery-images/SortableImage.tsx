import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageCard from './ImageCard';
import { memo } from 'react';

function SortableImage({ image, onDelete, onUpdateTitle }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: image.id,
        transition: {
            duration: 180,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Notion-style
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ImageCard
                image={image}
                onDelete={onDelete}
                onUpdateTitle={onUpdateTitle}
                dragHandleProps={{
                    ref: setActivatorNodeRef,
                    ...listeners,
                    ...attributes,
                }}
            />
        </div>
    );
}

export default memo(SortableImage);
