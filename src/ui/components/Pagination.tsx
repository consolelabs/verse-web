import clsx from "clsx";

interface Props {
  page: number;
  className?: string;
  isLastPage?: boolean;
  hideOnSinglePage?: boolean;
  onChange: (page: number) => void;
}

export const Pagination = (props: Props) => {
  const { page, className, isLastPage, hideOnSinglePage, onChange } = props;

  if (hideOnSinglePage && isLastPage && page === 1) {
    return null;
  }

  return (
    <div className={clsx("flex items-center space-x-2", className)}>
      <span className="font-medium">Page {page}</span>
      <span>-</span>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="disabled:opacity-30 underline"
      >
        Prev
      </button>
      <span>-</span>
      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onChange(page + 1)}
        className="disabled:opacity-30 underline"
      >
        Next
      </button>
    </div>
  );
};
