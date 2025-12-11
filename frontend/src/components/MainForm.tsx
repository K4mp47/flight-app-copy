"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronsUpDown,
  PlaneTakeoff,
  PlaneLanding,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Airport = {
  iata_code: string;
  name: string;
  city: {
    name: string;
  };
};

const FormSchema = z.object({
  dod: z.date({ required_error: "Date of departure is required." }),
  dor: z.date().optional(),
  dpc: z.string({ required_error: "Departure city required" }),
  dpa: z.string({ required_error: "Arrival city required" }),
  class: z.string({ required_error: "Class required" }),
  terms: z.boolean().default(false).optional(),
  adults: z.number().int().min(1, "At least 1 adult required."),
  children: z.number().int().min(0),
  infants: z.number().int().min(0),
});

export function MainForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState("round-trip");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openArrival, setOpenArrival] = useState(false);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await api.get<{ airports: Airport[] }>("/airports");
        setAirports(response.airports);
      } catch (error) {
        toast.error("Failed to fetch airports.");
      }
    };
    fetchAirports();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      infants: 0,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const params = new URLSearchParams();
    params.append("origin", data.dpc);
    params.append("destination", data.dpa);
    params.append("departure_date", format(data.dod, "yyyy-MM-dd"));
    if (data.dor) {
      params.append("return_date", format(data.dor, "yyyy-MM-dd"));
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 bg-gradient-to-b from-[#1e2022] to-black rounded-2xl shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <RadioGroup
            defaultValue="round-trip"
            className="grid grid-cols-2 gap-4"
            onValueChange={setTripType}
          >
            <div>
              <RadioGroupItem value="round-trip" id="round-trip" className="peer sr-only" />
              <FormLabel
                htmlFor="round-trip"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                Round Trip
              </FormLabel>
            </div>
            <div>
              <RadioGroupItem value="one-way" id="one-way" className="peer sr-only" />
              <FormLabel
                htmlFor="one-way"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                One Way
              </FormLabel>
            </div>
          </RadioGroup>
          {/* --- City Selection --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departure */}
            <FormField
              control={form.control}
              name="dpc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <PlaneTakeoff className="w-4 h-4" /> Departure
                  </FormLabel>
                  <Popover open={openDeparture} onOpenChange={setOpenDeparture}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal h-12 bg-[#1e2022] text-white hover:bg-gray-700 transition",
                            !field.value && "text-gray-400"
                          )}
                        >
                          {field.value
                            ? airports.find(
                                airport => airport.iata_code === field.value
                              )?.name
                            : "Select airport..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full bg-[#1e2022]  p-0">
                      <div className="flex flex-col">
                        {airports.map(airport => (
                          <Button
                            key={airport.iata_code}
                            variant="ghost"
                            className="justify-start text-gray-200 hover:bg-gray-800"
                            onClick={() => {
                              field.onChange(airport.iata_code);
                              setOpenDeparture(false);
                            }}
                          >
                            {airport.name} ({airport.iata_code})
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arrival */}
            <FormField
              control={form.control}
              name="dpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <PlaneLanding className="w-4 h-4" /> Arrival
                  </FormLabel>
                  <Popover open={openArrival} onOpenChange={setOpenArrival}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal h-12 bg-[#1e2022] text-white hover:bg-gray-700 transition",
                            !field.value && "text-gray-400"
                          )}
                        >
                          {field.value
                            ? airports.find(
                                airport => airport.iata_code === field.value
                              )?.name
                            : "Select airport..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full bg-[#1e2022]  p-0">
                      <div className="flex flex-col">
                        {airports.map(airport => (
                          <Button
                            key={airport.iata_code}
                            variant="ghost"
                            className="justify-start text-gray-200 hover:bg-gray-800"
                            onClick={() => {
                              field.onChange(airport.iata_code);
                              setOpenArrival(false);
                            }}
                          >
                            {airport.name} ({airport.iata_code})
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Dates --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Departure Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal h-12 bg-[#1e2022] text-white hover:bg-gray-700 transition",
                            !field.value && "text-gray-400"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMM d, yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-[#1e2022]  p-2">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {tripType === "round-trip" && (
              <FormField
                control={form.control}
                name="dor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> Return Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between text-left font-normal h-12 bg-[#1e2022] text-white hover:bg-gray-700 transition",
                              !field.value && "text-gray-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto bg-[#1e2022]  p-2">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* --- Class + Passengers --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class */}
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Class</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      {["First", "Business", "Premium", "Economy"].map(cls => (
                        <FormItem
                          key={cls}
                          className="flex items-center space-x-2 rounded-md bg-[#1e2022] border px-3 py-2 hover:bg-[#303336] transition"
                        >
                          <FormControl>
                            <RadioGroupItem value={cls} />
                          </FormControl>
                          <FormLabel className="text-sm text-gray-200 font-normal">
                            {cls}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Passengers */}
            <div className="space-y-3">
              <FormLabel className="text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" /> Passengers
              </FormLabel>
              {["adults", "children", "infants"].map((type, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={type as "adults" | "children" | "infants"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400 capitalize">
                        {type}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={8}
                          value={field.value}
                          onChange={e => field.onChange(Number(e.target.value))}
                          className="bg-gray-800 text-white h-10 focus:ring-1 focus:ring-white transition"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* --- Terms --- */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-gray-300 text-sm">
                  I accept the terms and conditions
                </FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-black bg-white font-semibold rounded-lg hover:bg-gray-200 transition-all"
          >
            Search Flights
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default MainForm;
