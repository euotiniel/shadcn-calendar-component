## Calendar Date Picker Component in Next.js

### Prerequisites

Ensure you have a Next.js project set up. If not, create one:

```bash
npx create-next-app my-app --typescript
cd my-app
```

### Step 1: Install Required Dependencies

Install the necessary dependencies:

```bash
npm install date-fns date-fns-tz react-day-picker
npx shadcn@latest init
npx shadcn@latest add button calendar popover select
```

### Step 2: Create the Calendar Date Picker Component

Create `calendar-date-picker.tsx` in your `components` directory:

```tsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns";
import { toDate, formatInTimeZone } from "date-fns-tz";
import type { DateRange } from "react-day-picker";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const multiSelectVariants = cva(
  "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-background",
        link: "text-primary underline-offset-4 hover:underline text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CalendarDatePickerProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  id?: string;
  className?: string;
  date: DateRange;
  closeOnSelect?: boolean;
  numberOfMonths?: 1 | 2;
  yearsRange?: number;
  minYear?: number;
  maxYear?: number;
  onDateSelect: (range: { from: Date; to: Date }) => void;
}

export const CalendarDatePicker = React.forwardRef<
  HTMLButtonElement,
  CalendarDatePickerProps
>(
  (
    {
      id = "calendar-date-picker",
      className,
      date,
      closeOnSelect = false,
      numberOfMonths = 2,
      yearsRange = 10,
      minYear = 1000,
      maxYear = 3000,
      onDateSelect,
      variant,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [selectedRange, setSelectedRange] = React.useState<string | null>(
      numberOfMonths === 2 ? "Este Ano" : "Hoje"
    );
    const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(
      date?.from
    );
    const [yearFrom, setYearFrom] = React.useState<number | undefined>(
      date?.from?.getFullYear()
    );
    const [monthTo, setMonthTo] = React.useState<Date | undefined>(
      numberOfMonths === 2 ? date?.to : date?.from
    );
    const [yearTo, setYearTo] = React.useState<number | undefined>(
      numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
    );
    const [highlightedPart, setHighlightedPart] = React.useState<string | null>(
      null
    );
    
    // Estados para autocompletar
    const [monthFromInput, setMonthFromInput] = React.useState("");
    const [yearFromInput, setYearFromInput] = React.useState("");
    const [monthToInput, setMonthToInput] = React.useState("");
    const [yearToInput, setYearToInput] = React.useState("");
    const [showMonthFromDropdown, setShowMonthFromDropdown] = React.useState(false);
    const [showYearFromDropdown, setShowYearFromDropdown] = React.useState(false);
    const [showMonthToDropdown, setShowMonthToDropdown] = React.useState(false);
    const [showYearToDropdown, setShowYearToDropdown] = React.useState(false);
    const [isEditingMonthFrom, setIsEditingMonthFrom] = React.useState(false);
    const [isEditingYearFrom, setIsEditingYearFrom] = React.useState(false);
    const [isEditingMonthTo, setIsEditingMonthTo] = React.useState(false);
    const [isEditingYearTo, setIsEditingYearTo] = React.useState(false);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleClose = () => setIsPopoverOpen(false);

    const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

    const selectDateRange = (from: Date, to: Date, range: string) => {
      const startDate = startOfDay(toDate(from, { timeZone }));
      const endDate =
        numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate;
      onDateSelect({ from: startDate, to: endDate });
      setSelectedRange(range);
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
      closeOnSelect && setIsPopoverOpen(false);
    };

    const handleDateSelect = (range: DateRange | undefined) => {
      if (range) {
        let from = startOfDay(toDate(range.from as Date, { timeZone }));
        let to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from;
        if (numberOfMonths === 1) {
          if (range.from !== date.from) {
            to = from;
          } else {
            from = startOfDay(toDate(range.to as Date, { timeZone }));
          }
        }
        onDateSelect({ from, to });
        setMonthFrom(from);
        setYearFrom(from.getFullYear());
        setMonthTo(to);
        setYearTo(to.getFullYear());
      }
      setSelectedRange(null);
    };

    const handleMonthChange = (newMonthIndex: number, part: string) => {
      setSelectedRange(null);
      if (part === "from") {
        if (yearFrom !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > 11) return;
          const newMonth = new Date(yearFrom, newMonthIndex, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(toDate(newMonth, { timeZone }))
              : date?.from
                ? new Date(
                    date.from.getFullYear(),
                    newMonth.getMonth(),
                    date.from.getDate()
                  )
                : newMonth;
          const to =
            numberOfMonths === 2
              ? date.to
                ? endOfDay(toDate(date.to, { timeZone }))
                : endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthFrom(newMonth);
            setMonthTo(date.to);
          }
        }
      } else {
        if (yearTo !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > 11) return;
          const newMonth = new Date(yearTo, newMonthIndex, 1);
          const from = date.from
            ? startOfDay(toDate(date.from, { timeZone }))
            : startOfMonth(toDate(newMonth, { timeZone }));
          const to =
            numberOfMonths === 2
              ? endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthTo(newMonth);
            setMonthFrom(date.from);
          }
        }
      }
    };

    const handleYearChange = (newYear: number, part: string) => {
      setSelectedRange(null);
      if (newYear < minYear || newYear > maxYear) return;
      
      if (part === "from") {
        const newMonth = monthFrom
          ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
          : new Date(newYear, 0, 1);
        const from =
          numberOfMonths === 2
            ? startOfMonth(toDate(newMonth, { timeZone }))
            : date.from
              ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
              : newMonth;
        const to =
          numberOfMonths === 2
            ? date.to
              ? endOfDay(toDate(date.to, { timeZone }))
              : endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setYearFrom(newYear);
          setMonthFrom(newMonth);
          setYearTo(date.to?.getFullYear());
          setMonthTo(date.to);
        }
      } else {
        const newMonth = monthTo
          ? new Date(newYear, monthTo.getMonth(), 1)
          : new Date(newYear, 0, 1);
        const from = date.from
          ? startOfDay(toDate(date.from, { timeZone }))
          : startOfMonth(toDate(newMonth, { timeZone }));
        const to =
          numberOfMonths === 2
            ? endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setYearTo(newYear);
          setMonthTo(newMonth);
          setYearFrom(date.from?.getFullYear());
          setMonthFrom(date.from);
        }
      }
    };

    // Função para filtrar meses baseado no input
    const getFilteredMonths = (input: string) => {
      if (!input) return months;
      return months.filter(month => 
        month.toLowerCase().includes(input.toLowerCase())
      );
    };

    // Função para gerar anos baseado no input
    const getFilteredYears = (input: string) => {
      if (!input) {
        // Se não há input, mostra o range padrão
        const today = new Date();
        return Array.from(
          { length: yearsRange + 1 },
          (_, i) => today.getFullYear() - yearsRange / 2 + i
        );
      }
      
      const inputNum = parseInt(input);
      if (isNaN(inputNum)) return [];
      
      // Gera anos próximos ao que foi digitado
      const years = [];
      const startYear = Math.max(minYear, inputNum - 5);
      const endYear = Math.min(maxYear, inputNum + 5);
      
      for (let year = startYear; year <= endYear; year++) {
        if (year.toString().includes(input)) {
          years.push(year);
        }
      }
      
      return years.sort((a, b) => Math.abs(a - inputNum) - Math.abs(b - inputNum));
    };

    const today = new Date();

    const dateRanges = [
      { label: "Hoje", start: today, end: today },
      { label: "Ontem", start: subDays(today, 1), end: subDays(today, 1) },
      {
        label: "Esta Semana",
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      },
      {
        label: "Semana Passada",
        start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
        end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
      },
      { label: "Últimos 7 Dias", start: subDays(today, 6), end: today },
      {
        label: "Este Mês",
        start: startOfMonth(today),
        end: endOfMonth(today),
      },
      {
        label: "Mês Passado",
        start: startOfMonth(subDays(today, today.getDate())),
        end: endOfMonth(subDays(today, today.getDate())),
      },
      { label: "Este Ano", start: startOfYear(today), end: endOfYear(today) },
      {
        label: "Ano Passado",
        start: startOfYear(subDays(today, 365)),
        end: endOfYear(subDays(today, 365)),
      },
    ];

    const handleMouseOver = (part: string) => {
      setHighlightedPart(part);
    };

    const handleMouseLeave = () => {
      setHighlightedPart(null);
    };

    // const handleWheel = (event: React.WheelEvent, part: string) => {
    const handleWheel = (event: React.WheelEvent) => {
      event.preventDefault();
      setSelectedRange(null);
      if (highlightedPart === "firstDay") {
        const newDate = new Date(date.from as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate <= (date.to as Date)) {
          numberOfMonths === 2
            ? onDateSelect({ from: newDate, to: new Date(date.to as Date) })
            : onDateSelect({ from: newDate, to: newDate });
          setMonthFrom(newDate);
        } else if (newDate > (date.to as Date) && numberOfMonths === 1) {
          onDateSelect({ from: newDate, to: newDate });
          setMonthFrom(newDate);
        }
      } else if (highlightedPart === "firstMonth") {
        const currentMonth = monthFrom ? monthFrom.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "from");
      } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
        const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "from");
      } else if (highlightedPart === "secondDay") {
        const newDate = new Date(date.to as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate >= (date.from as Date)) {
          onDateSelect({ from: new Date(date.from as Date), to: newDate });
          setMonthTo(newDate);
        }
      } else if (highlightedPart === "secondMonth") {
        const currentMonth = monthTo ? monthTo.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "to");
      } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
        const newYear = yearTo + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "to");
      }
    };

    React.useEffect(() => {
      const firstDayElement = document.getElementById(`firstDay-${id}`);
      const firstMonthElement = document.getElementById(`firstMonth-${id}`);
      const firstYearElement = document.getElementById(`firstYear-${id}`);
      const secondDayElement = document.getElementById(`secondDay-${id}`);
      const secondMonthElement = document.getElementById(`secondMonth-${id}`);
      const secondYearElement = document.getElementById(`secondYear-${id}`);

      const elements = [
        firstDayElement,
        firstMonthElement,
        firstYearElement,
        secondDayElement,
        secondMonthElement,
        secondYearElement,
      ];

      const addPassiveEventListener = (element: HTMLElement | null) => {
        if (element) {
          element.addEventListener(
            "wheel",
            handleWheel as unknown as EventListener,
            {
              passive: false,
            }
          );
        }
      };

      elements.forEach(addPassiveEventListener);

      return () => {
        elements.forEach((element) => {
          if (element) {
            element.removeEventListener(
              "wheel",
              handleWheel as unknown as EventListener
            );
          }
        });
      };
    }, [highlightedPart, date]);

    const formatWithTz = (date: Date, fmt: string) =>
      formatInTimeZone(date, timeZone, fmt);

    return (
      <>
        <style>
          {`
            .date-part {
              touch-action: none;
            }
          `}
        </style>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center gap-2"
              id="date"
              ref={ref}
              {...props}
              
                onClick={handleTogglePopover}
                suppressHydrationWarning
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                className={cn(
                  "w-full flex items-center justify-start h-9 px-4 py-2",
                  multiSelectVariants({ variant, className })
                )}
              >
                <span>
                  {date?.from ? (
                    date.to ? (
                      <>
                        <span
                          id={`firstDay-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "firstDay" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("firstDay")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "dd")}
                        </span>{" "}
                        <span
                          id={`firstMonth-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "firstMonth" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("firstMonth")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "LLL")}
                        </span>
                        ,{" "}
                        <span
                          id={`firstYear-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "firstYear" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("firstYear")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "y")}
                        </span>
                        {numberOfMonths === 2 && (
                          <>
                            {" - "}
                            <span
                              id={`secondDay-${id}`}
                              className={cn(
                                "date-part",
                                highlightedPart === "secondDay" &&
                                  "underline font-bold"
                              )}
                              onMouseOver={() => handleMouseOver("secondDay")}
                              onMouseLeave={handleMouseLeave}
                            >
                              {formatWithTz(date.to, "dd")}
                            </span>{" "}
                            <span
                              id={`secondMonth-${id}`}
                              className={cn(
                                "date-part",
                                highlightedPart === "secondMonth" &&
                                  "underline font-bold"
                              )}
                              onMouseOver={() => handleMouseOver("secondMonth")}
                              onMouseLeave={handleMouseLeave}
                            >
                              {formatWithTz(date.to, "LLL")}
                            </span>
                            ,{" "}
                            <span
                              id={`secondYear-${id}`}
                              className={cn(
                                "date-part",
                                highlightedPart === "secondYear" &&
                                  "underline font-bold"
                              )}
                              onMouseOver={() => handleMouseOver("secondYear")}
                              onMouseLeave={handleMouseLeave}
                            >
                              {formatWithTz(date.to, "y")}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span
                          id="day"
                          className={cn(
                            "date-part",
                            highlightedPart === "day" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("day")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "dd")}
                        </span>{" "}
                        <span
                          id="month"
                          className={cn(
                            "date-part",
                            highlightedPart === "month" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("month")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "LLL")}
                        </span>
                        ,{" "}
                        <span
                          id="year"
                          className={cn(
                            "date-part",
                            highlightedPart === "year" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("year")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "y")}
                        </span>
                      </>
                    )
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </span>
              </div>
              <div className="bg-primary flex items-center justify-center rounded-md p-2.5">
                <CalendarIcon className="h-4 w-4 dark:text-neutral-800 text-neutral-100" />
              </div>
            </button>
          </PopoverTrigger>
          {isPopoverOpen && (
            <PopoverContent
              className="w-auto"
              align="center"
              avoidCollisions={false}
              onInteractOutside={handleClose}
              onEscapeKeyDown={handleClose}
              style={{
                maxHeight: "var(--radix-popover-content-available-height)",
                overflowY: "auto",
              }}
            >
              <div className="flex">
                {numberOfMonths === 2 && (
                  <div className="hidden md:flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                    {dateRanges.map(({ label, start, end }) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "justify-start hover:bg-primary/90 hover:text-background",
                          selectedRange === label &&
                            "bg-primary text-background hover:bg-primary/90 hover:text-background"
                        )}
                        onClick={() => {
                          selectDateRange(start, end, label);
                          setMonthFrom(start);
                          setYearFrom(start.getFullYear());
                          setMonthTo(end);
                          setYearTo(end.getFullYear());
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2 ml-3">
                      {/* Mês De (From) com Autocomplete */}
                      <div className="relative">
                        <Input
                          placeholder="Mês"
                          className="w-[122px]"
                          value={isEditingMonthFrom ? monthFromInput : (monthFrom ? months[monthFrom.getMonth()] : "")}
                          onChange={(e) => {
                            setMonthFromInput(e.target.value);
                            setIsEditingMonthFrom(true);
                            setShowMonthFromDropdown(true);
                          }}
                          onFocus={() => {
                            setIsEditingMonthFrom(true);
                            setMonthFromInput(monthFrom ? months[monthFrom.getMonth()] : "");
                            setShowMonthFromDropdown(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setShowMonthFromDropdown(false);
                              setIsEditingMonthFrom(false);
                              setMonthFromInput("");
                            }, 200);
                          }}
                        />
                        {showMonthFromDropdown && isEditingMonthFrom && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-md max-h-40 overflow-y-auto">
                            {getFilteredMonths(monthFromInput).map((month, idx) => (
                              <div
                                key={idx}
                                className="px-3 py-2 hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  handleMonthChange(months.indexOf(month), "from");
                                  setMonthFromInput("");
                                  setIsEditingMonthFrom(false);
                                  setShowMonthFromDropdown(false);
                                  setSelectedRange(null);
                                }}
                              >
                                {month}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ano De (From) com Autocomplete */}
                      <div className="relative">
                        <Input
                          placeholder="Ano"
                          className="w-[122px]"
                          type="number"
                          min={minYear}
                          max={maxYear}
                          value={isEditingYearFrom ? yearFromInput : (yearFrom ? yearFrom.toString() : "")}
                          onChange={(e) => {
                            setYearFromInput(e.target.value);
                            setIsEditingYearFrom(true);
                            setShowYearFromDropdown(true);
                          }}
                          onFocus={() => {
                            setIsEditingYearFrom(true);
                            setYearFromInput(yearFrom ? yearFrom.toString() : "");
                            setShowYearFromDropdown(true);
                          }}
                          onBlur={(e) => {
                            const year = parseInt(e.target.value);
                            if (!isNaN(year) && year >= minYear && year <= maxYear) {
                              handleYearChange(year, "from");
                              setSelectedRange(null);
                            }
                            setTimeout(() => {
                              setShowYearFromDropdown(false);
                              setIsEditingYearFrom(false);
                              setYearFromInput("");
                            }, 200);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const year = parseInt(yearFromInput);
                              if (!isNaN(year) && year >= minYear && year <= maxYear) {
                                handleYearChange(year, "from");
                                setYearFromInput("");
                                setIsEditingYearFrom(false);
                                setShowYearFromDropdown(false);
                                setSelectedRange(null);
                              }
                            }
                          }}
                        />
                        {showYearFromDropdown && isEditingYearFrom && yearFromInput && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-md max-h-40 overflow-y-auto">
                            {getFilteredYears(yearFromInput).slice(0, 10).map((year) => (
                              <div
                                key={year}
                                className="px-3 py-2 hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  handleYearChange(year, "from");
                                  setYearFromInput("");
                                  setIsEditingYearFrom(false);
                                  setShowYearFromDropdown(false);
                                  setSelectedRange(null);
                                }}
                              >
                                {year}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {numberOfMonths === 2 && (
                      <div className="flex gap-2">
                        {/* Mês Até (To) com Autocomplete */}
                        <div className="relative">
                          <Input
                            placeholder="Mês"
                            className="w-[122px]"
                            value={isEditingMonthTo ? monthToInput : (monthTo ? months[monthTo.getMonth()] : "")}
                            onChange={(e) => {
                              setMonthToInput(e.target.value);
                              setIsEditingMonthTo(true);
                              setShowMonthToDropdown(true);
                            }}
                            onFocus={() => {
                              setIsEditingMonthTo(true);
                              setMonthToInput(monthTo ? months[monthTo.getMonth()] : "");
                              setShowMonthToDropdown(true);
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowMonthToDropdown(false);
                                setIsEditingMonthTo(false);
                                setMonthToInput("");
                              }, 200);
                            }}
                          />
                          {showMonthToDropdown && isEditingMonthTo && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-md max-h-40 overflow-y-auto">
                              {getFilteredMonths(monthToInput).map((month, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    handleMonthChange(months.indexOf(month), "to");
                                    setMonthToInput("");
                                    setIsEditingMonthTo(false);
                                    setShowMonthToDropdown(false);
                                    setSelectedRange(null);
                                  }}
                                >
                                  {month}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ano Até (To) com Autocomplete */}
                        <div className="relative">
                          <Input
                            placeholder="Ano"
                            className="w-[122px]"
                            type="number"
                            min={minYear}
                            max={maxYear}
                            value={isEditingYearTo ? yearToInput : (yearTo ? yearTo.toString() : "")}
                            onChange={(e) => {
                              setYearToInput(e.target.value);
                              setIsEditingYearTo(true);
                              setShowYearToDropdown(true);
                            }}
                            onFocus={() => {
                              setIsEditingYearTo(true);
                              setYearToInput(yearTo ? yearTo.toString() : "");
                              setShowYearToDropdown(true);
                            }}
                            onBlur={(e) => {
                              const year = parseInt(e.target.value);
                              if (!isNaN(year) && year >= minYear && year <= maxYear) {
                                handleYearChange(year, "to");
                                setSelectedRange(null);
                              }
                              setTimeout(() => {
                                setShowYearToDropdown(false);
                                setIsEditingYearTo(false);
                                setYearToInput("");
                              }, 200);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const year = parseInt(yearToInput);
                                if (!isNaN(year) && year >= minYear && year <= maxYear) {
                                  handleYearChange(year, "to");
                                  setYearToInput("");
                                  setIsEditingYearTo(false);
                                  setShowYearToDropdown(false);
                                  setSelectedRange(null);
                                }
                              }
                            }}
                          />
                          {showYearToDropdown && isEditingYearTo && yearToInput && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-md max-h-40 overflow-y-auto">
                              {getFilteredYears(yearToInput).slice(0, 10).map((year) => (
                                <div
                                  key={year}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    handleYearChange(year, "to");
                                    setYearToInput("");
                                    setIsEditingYearTo(false);
                                    setShowYearToDropdown(false);
                                    setSelectedRange(null);
                                  }}
                                >
                                  {year}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <Calendar
                      mode="range"
                      defaultMonth={monthFrom}
                      month={monthFrom}
                      onMonthChange={setMonthFrom}
                      selected={date}
                      onSelect={handleDateSelect}
                      numberOfMonths={numberOfMonths}
                      showOutsideDays={false}
                      className={className}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </>
    );
  }
);

CalendarDatePicker.displayName = "CalendarDatePicker";
```

### Step 3: Integrate the Component

Update `page.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const FormSchema = z.object({
  calendar: z.object({
    from: z.date(),
    to: z.date(),
  }),
  datePicker: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export default function Home() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      calendar: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
      datePicker: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    toast(
      `1. Date range: ${data.calendar.from.toDateString()} - ${data.calendar.to.toDateString()}
      \n2. Single date: ${data.datePicker.from.toDateString()}`
    );
  };

  return (
    <div className="flex items-start justify-start w-full my-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="calendar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sx font-normal text-muted-foreground">
                    Date Range
                  </FormLabel>
                  <FormControl className="w-full">
                    <CalendarDatePicker
                      date={field.value}
                      onDateSelect={({ from, to }) => {
                        form.setValue("calendar", { from, to });
                      }}
                      variant="outline"
                      numberOfMonths={2}
                      className="min-w-[250px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="datePicker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    Single Date
                  </FormLabel>
                  <FormControl className="w-full">
                    <CalendarDatePicker
                      date={field.value}
                      onDateSelect={({ from, to }) => {
                        form.setValue("calendar", { from, to });
                      }}
                      variant="outline"
                      numberOfMonths={1}
                      className="min-w-[250px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button variant="default" type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

### Step 4: Run Your Project

```bash
npm run dev
```
