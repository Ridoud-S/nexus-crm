import * as React from 'react'
import { cn } from '../../lib/utils'
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref) => <div ref={ref} className={cn('rounded-2xl border border-nexus-line bg-white shadow-[0_4px_20px_rgba(33,61,89,.035)]',className)} {...props}/> )
Card.displayName='Card'
export const CardContent = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-5',className)} {...props} />
export const CardHeader = ({className,...props}:React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-5 pb-3',className)} {...props} />
