"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 backdrop-blur-sm sticky top-0 z-20">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive("bold") ? "bg-accent text-accent-foreground" : "")}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive("italic") ? "bg-accent text-accent-foreground" : "")}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : "")}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : "")}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : "")}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : "")}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive("blockquote") ? "bg-accent text-accent-foreground" : "")}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    const url = window.prompt("URL")
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    }
                }}
                className={cn(editor.isActive("link") ? "bg-accent text-accent-foreground" : "")}
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export function InvoiceEditor({ content, onChange, placeholder = "Start typing your invoice details..." }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-6",
            },
        },
    })

    return (
        <div className="w-full border rounded-xl overflow-hidden bg-background">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
