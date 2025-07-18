import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
    className,
    datePlaceholder = 'Select date',
    value,
    onChange,
    minDate = undefined,
    maxDate = new Date(),
    defaultMonth = undefined,
    disabled = false,
}: {
    className?: string
    datePlaceholder?: string
    value?: Date
    onChange?: (date: Date | undefined) => void
    minDate?: Date
    maxDate?: Date
    defaultMonth?: Date
    disabled?: boolean
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon />
                    {value ? format(value, "PPP") : <span>{datePlaceholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    disabled={(date) => date > maxDate || (minDate ? date < minDate : false)}
                    initialFocus
                    defaultMonth={defaultMonth || value}
                />
            </PopoverContent>
        </Popover>
    )
}
