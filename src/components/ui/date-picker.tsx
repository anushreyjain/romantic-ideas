import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type DatePickerProps = {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
};

const selectBase =
  "h-9 rounded-md border border-[var(--border-strong)] bg-[var(--bg)] px-3 text-sm text-[var(--heading)] shadow-sm outline-none transition focus:border-[var(--cta)]/60 focus:ring-2 focus:ring-[var(--cta)]/15";

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [y, m, d] = value.split("-").map(Number);

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => thisYear - i);
  const days = Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1);

  function emit(newY: number, newM: number, newD: number) {
    const safeD = Math.min(newD, daysInMonth(newY, newM));
    onChange(
      `${newY}-${String(newM).padStart(2, "0")}-${String(safeD).padStart(2, "0")}`,
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        value={m}
        onChange={(e) => emit(y, +e.target.value, d)}
        className={cn(selectBase, "flex-1")}
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>{name}</option>
        ))}
      </select>

      <select
        value={d}
        onChange={(e) => emit(y, m, +e.target.value)}
        className={cn(selectBase, "w-[4.5rem]")}
      >
        {days.map((day) => (
          <option key={day} value={day}>{String(day).padStart(2, "0")}</option>
        ))}
      </select>

      <select
        value={y}
        onChange={(e) => emit(+e.target.value, m, d)}
        className={cn(selectBase, "w-[5.5rem]")}
      >
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}
