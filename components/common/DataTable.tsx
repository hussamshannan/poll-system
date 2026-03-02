"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  title?: string;
  total?: number;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  title,
  total,
  emptyMessage = "No data found.",
  actions,
}: DataTableProps<T>) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>
            {title}
            {total !== undefined && (
              <span className="ms-2 text-muted-foreground font-normal text-base">
                ({total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 text-start font-medium ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th className="py-3 text-end font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={keyExtractor(row)} className="border-b">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 ${col.className ?? ""}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                    {actions && (
                      <td className="py-3 text-end">{actions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
