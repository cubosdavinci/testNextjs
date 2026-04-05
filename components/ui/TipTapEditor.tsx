'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState } from 'react'
import WarningAlert from '@/components/banners/WarningAlert'
import { validateProductDescription } from '@/lib/validate/products/description'
import { ZodError } from 'zod'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur: (value: string) => void
  max?: number // maximum number of characters
}

const TipTapEditor = ({ value, onChange, onBlur, max = 50 }: TipTapEditorProps) => {
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'border p-2 rounded min-h-[150px] focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    const validator = validateProductDescription(max)

    const handleUpdate = () => {
      let plainText = editor.getText()
      let html = editor.getHTML()

      // Truncate if exceeds max
      if (max && plainText.length > max) {
        plainText = plainText.slice(0, max)
        editor.commands.setContent(plainText)
        html = editor.getHTML()
      }

      // Forward change to parent
      onChange(html)

      // Validate dynamically
      try {
        validator.parse(plainText)
        setError(null)
      } catch (err) {
        if (err instanceof ZodError) {
          setError(err.issues[0]?.message || 'Invalid description')
        } else {
          setError('Unexpected error')
        }
      }
    }

    const handleBlur = () => {
      onBlur(editor.getHTML())
    }

    editor.on('update', handleUpdate)
    editor.on('blur', handleBlur)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('blur', handleBlur)
    }
  }, [editor, onChange, onBlur, max])

  if (!editor) return null

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-300' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-300' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-300' : ''}
        >
          Underline
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}
        >
          H2
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <p className="text-gray-500 text-sm mt-1">
        Characters: {editor.getText().length} / {max}
      </p>

      {/* Error alert from Zod validation */}
      {error && <WarningAlert message={error} />}
    </div>
  )
}

export default TipTapEditor
