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
    <div className="flex justify-center px-5 pb-20">
      <div className="flex w-full max-w-[540px] flex-col">
        <main className="flex flex-col min-h-screen items-start justify-start">
          <h1 className="text-xl font-semibold">Calendar Date Picker</h1>
          <p className="mt-5">
            A calendar date picker component designed with shadcn/ui. Based on
            the work of{" "}
            <a
              href="https://github.com/sersavan"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b"
            >
              sersavan
            </a>
            .
          </p>
          <h1 className="text-lg font-medium mt-8">Instalation</h1>
          <p className="mt-5 text-muted-foreground">
            For setup and usage details, follow the instructions on our{" "}
            <a
              href="https://github.com/seu-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b"
            >
              GitHub
            </a>
            .
          </p>
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
          <h1 className="text-lg font-medium">What has changed?</h1>
          <p className="mt-5 text-muted-foreground">
            This component has been upgraded and customized to provide a more
            familiar and user-friendly experience compared to the original
            version. Here’s what’s new:
          </p>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong>Visual refresh:</strong> Updated styling with a calendar
              icon, making it feel closer to the native HTML date input.
            </li>
            <li>
              <strong>Autocomplete for Month and Year:</strong> Smart
              autocomplete system for quick selection of months and years.
            </li>
            <li>
              <strong>Input with Dropdown:</strong> Replaced default{" "}
              <code>&lt;Select&gt; </code>
              components with custom input fields and dropdowns.
            </li>
            <li>
              <strong>Range validation:</strong> Added <code>minYear</code> and
              <code> maxYear</code> props to control the valid year range.
            </li>
            <li>
              <strong>Smart filtering:</strong> Months can be filtered by
              partial text input and years by numeric proximity.
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
}
