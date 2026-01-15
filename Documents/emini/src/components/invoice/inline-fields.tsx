"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableTextProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    multiline?: boolean
}

export function EditableText({ value, onChange, placeholder, className, multiline }: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing) {
            if (multiline) textareaRef.current?.focus()
            else inputRef.current?.focus()
        }
    }, [isEditing, multiline])

    const handleBlur = () => {
        setIsEditing(false)
        onChange(tempValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
            handleBlur()
        }
        if (e.key === "Escape") {
            setTempValue(value)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    ref={textareaRef}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-full bg-muted/50 rounded p-1 outline-none ring-1 ring-primary resize-none min-h-[4em]",
                        className
                    )}
                />
            )
        }
        return (
            <input
                ref={inputRef}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-full bg-muted/50 rounded px-1 outline-none ring-1 ring-primary",
                    className
                )}
            />
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors min-h-[1.2em]",
                !value && "text-muted-foreground",
                className
            )}
        >
            {value || placeholder}
        </div>
    )
}

interface EditableNumberProps {
    value: number
    onChange: (value: number) => void
    prefix?: string
    className?: string
    step?: string
}

export function EditableNumber({ value, onChange, prefix = "", className, step = "0.01" }: EditableNumberProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value.toString())
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing) inputRef.current?.focus()
    }, [isEditing])

    const handleBlur = () => {
        setIsEditing(false)
        const val = parseFloat(tempValue)
        onChange(isNaN(val) ? 0 : val)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleBlur()
        if (e.key === "Escape") {
            setTempValue(value.toString())
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="number"
                step={step}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                    "bg-muted/50 rounded px-1 outline-none ring-1 ring-primary w-20 text-right",
                    className
                )}
            />
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors text-right",
                className
            )}
        >
            {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
    )
}
