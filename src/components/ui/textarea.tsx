import * as React from 'react'
import { cn } from '../../lib/utils'
export const Textarea=React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({className,...props},ref)=><textarea ref={ref} className={cn('flex min-h-24 w-full rounded-xl border border-[#DCE5ED] bg-white px-3.5 py-3 text-sm text-nexus-ink outline-none placeholder:text-[#99A8B8] focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/10',className)} {...props}/>)
Textarea.displayName='Textarea'
