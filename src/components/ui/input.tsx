import * as React from 'react'
import { cn } from '../../lib/utils'
export const Input=React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({className,type,...props},ref) => <input type={type} ref={ref} className={cn('flex h-11 w-full rounded-xl border border-[#DCE5ED] bg-white px-3.5 py-2 text-sm text-nexus-ink shadow-sm outline-none placeholder:text-[#99A8B8] focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/10 disabled:opacity-50',className)} {...props}/>)
Input.displayName='Input'
