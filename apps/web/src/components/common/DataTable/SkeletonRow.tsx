interface SkeletonRowProps {
  cols: number;
}

// Deterministic per-column width pattern so skeleton rows look varied
// without calling Math.random() during render (which React Compiler flags
// as impure and is non-deterministic across re-renders).
const WIDTH_PATTERN = [90, 70, 85, 65, 80, 75];

const SkeletonRow = ({ cols }: SkeletonRowProps) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"
          style={{ width: `${WIDTH_PATTERN[i % WIDTH_PATTERN.length]}%` }}
        />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;
