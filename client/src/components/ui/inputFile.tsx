import * as React from 'react'
import { cn } from '@/lib/utils'

interface FileDropInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  onFileChange?: (file: File | null) => void
}

const FileDropInput = React.forwardRef<HTMLInputElement, FileDropInputProps>(
  ({ className, onFileChange, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [file, setFile] = React.useState<File | null>(null)

    const handleFiles = (files: FileList | null) => {
      if (!files || files.length === 0) return
      const selectedFile = files[0]
      setFile(selectedFile)
      onFileChange?.(selectedFile)
    }

    return (
      <label
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-all duration-200',
          file
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : isDragging
              ? 'border-ring bg-accent/40'
              : 'border-input hover:bg-accent/30',
          className,
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <input
          ref={ref}
          type='file'
          className='sr-only'
          onChange={(e) => handleFiles(e.target.files)}
          {...props}
        />

        {!file ? (
          <div className='flex flex-col items-center gap-2 text-muted-foreground'>
            <div className='text-4xl'>📁</div>
            <p className='text-sm font-medium'>فایل را بکشید یا کلیک کنید</p>
            <p className='text-xs text-muted-foreground'>
              فرمت‌های مجاز: jpg, png, pdf, ...
            </p>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2 text-green-700 dark:text-green-400'>
            <div className='text-4xl'>✅</div>
            <p className='text-sm font-semibold'>{file.name}</p>
            <p className='text-xs opacity-80'>
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <p className='text-xs text-muted-foreground'>
              برای تغییر مجدد کلیک کنید
            </p>
          </div>
        )}
      </label>
    )
  },
)

FileDropInput.displayName = 'FileDropInput'

export { FileDropInput }
