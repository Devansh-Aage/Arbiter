import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, title, error, htmlFor, ...props }: React.ComponentProps<"textarea"> & { title: string, error?: string, htmlFor: string }) {
  return (
    <div className={`flex-1 flex mt-3 flex-col ${className}`}>
      <label htmlFor={htmlFor} className="text-foreground text-sm font-medium">
        {title}
      </label>
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
    </div>

  )
}

export { Textarea }
