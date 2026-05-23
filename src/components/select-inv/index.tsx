import type { SelectOption } from "@/types/options";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/ui/select";

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
					{options.map((option) => (
						<SelectItem value={option.key} key={option.key}>
							{option.value}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
