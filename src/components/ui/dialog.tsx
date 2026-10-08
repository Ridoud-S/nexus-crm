import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({className,children,...props},ref)=> <DialogPrimitive.Portal>
  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#13283D]/55 backdrop-blur-[3px] data-[state=open]:animate-in" />
  <DialogPrimitive.Content ref={ref} className={cn('fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-[0_24px_90px_rgba(0,0,0,.23)] outline-none',className)} {...props}>
    {children}<DialogPrimitive.Close aria-label="Cerrar" className="absolute right-5 top-5 rounded-lg p-1 text-[#8999A9] transition hover:bg-slate-100 hover:text-nexus-ink"><X size={18}/></DialogPrimitive.Close>
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>)
DialogContent.displayName='DialogContent'
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
