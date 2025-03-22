import type { FC, HTMLAttributes } from "react";
import { Button } from "./ui/button";
import { cn } from '../lib/utils';

type ValueButtonsProps = {
	value: number;
	onChange: (value: number) => void;
	step?: number;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

export const ValueButtons: FC<ValueButtonsProps> = ({ value, onChange, step = 100, className, ...props }) => {
	return (
		<div className={cn("flex gap-2", className)} {...props}>
			<Button
				className=""
				onClick={() => onChange(value + Math.round(step * 10))}
			>
				↑
			</Button>
			<Button className="" onClick={() => onChange(value + step)}>
				+
			</Button>
			<Button className="" onClick={() => onChange(value - step)}>
				-
			</Button>
			<Button
				className=""
				onClick={() => onChange(value - Math.round(step * 10))}
			>
				↓
			</Button>
		</div>
	);
};
