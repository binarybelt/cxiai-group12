type DataTableVariant = "standard" | "striped" | "compact";

export interface DataTableProps {
  headers: string[];
  rows: string[][];
  caption: string;
  variant?: DataTableVariant;
}

const rowClasses: Record<DataTableVariant, string> = {
  standard: "",
  striped: "odd:bg-white even:bg-gray-100",
  compact: "",
};

export function DataTable({
  headers = [],
  rows = [],
  caption,
  variant = "standard",
}: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200 bg-white shadow-token-sm">
      <table className="min-w-full border-separate border-spacing-0">
        <caption className="px-token-lg pt-token-lg text-left text-body-sm font-semibold text-gray-700">
          {caption}
        </caption>
        <thead>
          <tr className="bg-pfizer-blue-700 text-left text-body-sm text-white">
            {headers.map((header) => (
              <th key={header} scope="col" className="px-token-lg py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.join("-")}
              className={variant === "compact" ? "text-body-sm" : rowClasses[variant]}
            >
              {row.map((cell) => (
                <td
                  key={`${row[0]}-${cell}`}
                  className={`border-t border-gray-200 px-token-lg ${
                    variant === "compact" ? "py-2" : "py-4"
                  } text-gray-700`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
