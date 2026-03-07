import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
  SelectLabel,
  SelectItem
 } from "@/ui/select";

import { SelectOption } from "@/types/options";

interface SelectProps {
  options: SelectOption[];
  label: string;
  onChange: (value: string) => void;
}

export function SelectInv({ options, label, onChange }: SelectProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options.map(option => (
            <SelectItem value={option.key} key={option.key}>{option.value}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
