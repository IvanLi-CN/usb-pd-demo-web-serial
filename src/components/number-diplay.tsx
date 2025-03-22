import { useMemo, type FC, type HTMLAttributes } from "react";
import { cn } from '../lib/utils';

type NumberDisplayProps = {
	value: number | undefined;
	unit?: string;
} & HTMLAttributes<HTMLDivElement>;

export const NumberDisplay: FC<NumberDisplayProps> = ({ value, unit, ...props }) => {
	const valueText = useMemo(() => {
		if (!value) return "--.--";

		const numStr = value.toLocaleString("fullwide", { useGrouping: false });
		let [integer = "", decimal = ""] = numStr.split(".");
		const positions = 5;

		if (integer.length >= positions) return integer;

		const maxDecimalLen = positions - integer.length - 1;
		if (maxDecimalLen <= 0) return `${integer}.`;

		decimal = decimal.padEnd(maxDecimalLen, "0").slice(0, maxDecimalLen);
		return `${integer}.${decimal}`;
	}, [value]);

	return (
		<div
			{...props}
			className={cn(
				"text-center text-3xl font-mono",
				"p-2 rounded-lg",
				"text-sky-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950",
				props.className,
			)}
		>
			{valueText}
			<small className='text-xl ml-2'>{unit}</small>
		</div>
	);
};
