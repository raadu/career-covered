interface SkeletonRowProps {
  cols: number;
}

const SkeletonRow = ({ cols }: SkeletonRowProps) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;
