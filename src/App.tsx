import { useEffect, useState } from "react";
import "./App.css";
import { Card } from "./components/ui/card";
import { NumberDisplay } from "./components/number-diplay";
import { twMerge } from "tailwind-merge";
import { ValueButtons } from "./components/value-buttons";
import { useDevice } from "./hooks/use-device";
import { Button } from "./components/ui/button";

function App() {
	const { open, state, setVoltage, setCurrent, isOpen, isConnected, close } =
		useDevice();

	const [voltage, setLocalVoltage] = useState(0);
	const [current, setLocalCurrent] = useState(0);

	useEffect(() => {
		setVoltage(voltage || 0);
		setCurrent(current || 0);

		const timer = setInterval(() => {
			setVoltage(voltage || 0);
			setTimeout(() => setCurrent(current || 0), 500);
		}, 1000);

		return () => clearInterval(timer);
	}, [setVoltage, voltage, setCurrent, current]);

	return (
		<div>
			<Card className="h-full lg:w-3xl md:w-xl m-auto">
				<div className="grid grid-cols-3 gap-2 justify-items-center">
					<NumberDisplay
						unit="V"
						value={state?.voltage}
						className={twMerge(
							"lg:w-52 lg:text-4xl",
							"md:w-32 md:text-3xl",
							"text-yellow-500 bg-yellow-50",
						)}
					/>
					<NumberDisplay
						unit="A"
						value={state?.current}
						className={twMerge(
							"lg:w-52 lg:text-4xl",
							"md:w-32 md:text-3xl",
							"text-red-500 bg-red-50",
						)}
					/>
					<NumberDisplay
						unit="W"
						value={state ? state.voltage * state.current : undefined}
						className={twMerge(
							"lg:w-52 lg:text-4xl",
							"md:w-32 md:text-3xl",
							"text-green-500 bg-green-50",
						)}
					/>
					<NumberDisplay
						unit="V"
						value={voltage / 1000}
						className={twMerge(
							"lg:w-52 lg:text-4xl",
							"md:w-32 md:text-3xl",
							"text-yellow-400 bg-yellow-50",
						)}
					/>
					<NumberDisplay
						unit="A"
						value={current / 1000}
						className={twMerge(
							"lg:w-52 lg:text-4xl",
							"md:w-32 md:text-3xl",
							"text-red-400 bg-red-50",
						)}
					/>
					<ValueButtons
						value={voltage}
						onChange={setLocalVoltage}
						className="col-start-1"
					/>
					<ValueButtons value={current} onChange={setLocalCurrent} step={10} />
				</div>
			</Card>

			<Card className="h-full lg:w-3xl md:w-xl m-auto px-8 flex items-center">
				{isOpen ? (
					isConnected ? (
						<Button
							onClick={close}
							variant="destructive"
							className="w-lg bg-red-500"
						>
							Disconnect
						</Button>
					) : (
						<Button onClick={close} variant="secondary" className="w-lg">
							Connecting
						</Button>
					)
				) : (
					<Button onClick={open} className="w-lg">
						Connect
					</Button>
				)}
			</Card>
		</div>
	);
}

export default App;
