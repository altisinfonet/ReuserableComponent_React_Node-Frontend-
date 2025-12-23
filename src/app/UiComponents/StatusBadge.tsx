export default function StatusBadge({ status }: { status: string }) {
    const styles =
        status === 'Active'
            ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
            : 'bg-gray-200 text-gray-600 ring-1 ring-gray-300';

    return (
        <span
            className={`
        text-xs font-semibold
        px-3 py-1 rounded-full
        ${styles}
      `}
        >
            {status}
        </span>
    );
}
