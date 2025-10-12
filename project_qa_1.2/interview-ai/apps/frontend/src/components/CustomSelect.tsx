import { useState, useRef, useEffect } from 'react'

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder?: string
    className?: string
    error?: boolean
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Seleccionar...', className = '', error = false }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option: string) => {
        onChange(option)
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left input-futuristic py-2 text-sm ${error ? 'border-red-400' : ''} ${className} flex items-center justify-between`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300f5ff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <span className={value ? 'text-gray-200' : 'text-gray-500'}>
                    {value || placeholder}
                </span>
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 bg-[#1a1a27] border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-400/10 max-h-48 overflow-y-auto custom-scrollbar"
                    style={{
                        animation: 'fadeIn 0.15s ease-out'
                    }}
                >
                    {!value && (
                        <div
                            onClick={() => handleSelect('')}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:bg-[#252533] cursor-pointer transition-colors"
                        >
                            {placeholder}
                        </div>
                    )}
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${value === option
                                    ? 'bg-cyan-400/10 text-cyan-300 font-medium'
                                    : 'text-gray-300 hover:bg-[#252533]'
                                }`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
