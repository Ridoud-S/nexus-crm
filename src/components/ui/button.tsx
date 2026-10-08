import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-orange/40 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-nexus-primary text-white hover:bg-nexus-dark shadow-sm',
      orange: 'bg-nexus-orange text-white hover:bg-[#dd6214] shadow-[0_8px_20px_rgba(243,115,36,0.19)]',
      outline: 'border border-[#DEE6EE] bg-white text-nexus-ink hover:bg-[#F5F8FA]',
      ghost: 'text-nexus-ink hover:bg-[#F1F5F8]',
      subtle: 'bg-[#E8F0F6] text-nexus-primary hover:bg-[#DCE9F2]',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    },
    size: { default:'h-10 px-4 py-2', sm:'h-9 px-3', lg:'h-12 px-6 text-[14px]', icon:'h-10 w-10', xs:'h-8 px-2.5 text-xs' },
  },
  defaultVariants: { variant:'default', size:'default' },
})
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({className,variant,size,...props},ref) => <button ref={ref} className={cn(buttonVariants({variant,size,className}))} {...props} />)
Button.displayName='Button'
