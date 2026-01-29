import { cn } from "@/lib/utils";
import { type FC } from "react";

interface InputArbiterProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
  htmlFor: string;
  inputType?: string;
  className?: string;
  error?: string;
}

const InputArbiter: FC<InputArbiterProps> = ({
  htmlFor,
  title,
  inputType = "text",
  className,
  error,
  ...props
}) => {
  return (
    <div className={`flex-1 flex mt-3 flex-col ${className}`}>
      <label htmlFor={htmlFor} className="text-foreground text-sm font-medium">
        {title}
      </label>
      <input
        className={cn(
          "file:text-foreground mt-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-0 focus-visible:ring-primary/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        type={inputType}
        placeholder={`Enter ${title}`}
        {...props}
      />
      {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
    </div>
  );
};

export default InputArbiter;
