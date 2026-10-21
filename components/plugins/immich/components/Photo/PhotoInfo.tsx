export type PhotoInfoItem = readonly [label: string, value: string | null];

type PhotoInfoProps = {
  firstRow: readonly PhotoInfoItem[];
  secondRow: readonly PhotoInfoItem[];
};

export default function PhotoInfo({ firstRow, secondRow }: PhotoInfoProps) {
  const secondRowItems = secondRow.filter(([, value]) => value !== null && value !== '');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
        {firstRow
          .filter(([, value]) => value !== null && value !== '')
          .map(([label, value]) => (
            <span
              key={label}
              aria-label={`${label}：${value}`}
              className="min-w-0 flex-1 basis-40 text-center break-words"
            >
              {value}
            </span>
          ))}
      </div>
      {secondRowItems.length ? (
        <div className="flex w-full items-stretch divide-x divide-white/20 rounded-lg bg-white/5 py-3">
          {secondRowItems.map(([label, value]) => (
            <span
              key={label}
              aria-label={`${label}：${value}`}
              className="flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-1 px-2 text-center text-sm break-words text-white/90"
            >
              <span className="text-xs text-white/50">{label}</span>
              <span>{value}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
