import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export function DataTable<T extends { id: string }>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-800/30">
      <table className="min-w-full text-sm">
        <thead className="bg-[#071830] text-left text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-cyan-900/20 text-slate-200">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3">
                  {column.render
                    ? column.render(item)
                    : (item[column.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
