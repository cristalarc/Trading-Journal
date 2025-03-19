import type React from "react"

export const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse">{children}</table>
)

export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="">{children}</tbody>

export const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-4 border border-gray-200 ${className}`}>{children}</td>
)

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="p-4 border border-gray-200 font-medium">{children}</th>
)

export const TableRow = ({ children }: { children: React.ReactNode }) => <tr className="">{children}</tr>

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
)

export const Tooltip = ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => (
  <div className="relative">
    {children}
    {content}
  </div>
)

export const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-10 bg-white shadow-md rounded-md p-2 text-sm text-gray-800 top-full left-1/2 transform -translate-x-1/2">
    {children}
  </div>
)

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

export const TooltipTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => (
  <span>{children}</span>
)

