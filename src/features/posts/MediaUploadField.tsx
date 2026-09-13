import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { cn } from '@/lib/utils'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime']
const MAX_FILES = 4
const MAX_SIZE_BYTES = 10 * 1024 * 1024

interface MediaUploadFieldProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function MediaUploadField({ files, onChange }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    setError(null)
    const next = [...files]
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        setError(`You can attach up to ${MAX_FILES} files.`)
        break
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name} isn't a supported image or video type.`)
        continue
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`${file.name} is larger than 10MB.`)
        continue
      }
      next.push(file)
    }
    onChange(next)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <p className="text-sm font-medium text-gray-600">Drag photos/videos here, or click to browse</p>
        <p className="text-xs text-gray-400">PNG, JPEG, WEBP, GIF, MP4, MOV · up to 4 files · 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-md bg-gray-100">
              {file.type.startsWith('video/') ? (
                <video src={previews[index]} className="h-full w-full object-cover" />
              ) : (
                <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  removeAt(index)
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
