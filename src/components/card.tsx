import clsx from "clsx";

export const HorizontalCard = ({
	title,
	value,
	icon,
	color = "bg-gray",
}: {
	title: string;
	value: string;
	icon: string;
	color: string;
}) => {
	return (
		<div className="w-full sm:w-auto focus:ring-4 focus:outline-none focus:ring-gray-300 text-black rounded-lg flex items-center justify-between px-6 py-4 shadow-md space-x-8">
			<div
				className={clsx(
					"w-12 h-12 rounded-full flex items-center justify-center",
					color,
				)}
			>
				<img src={icon} alt="icon" className="w-6 h-6" />
			</div>
			<div className="text-left">
				<h4 className="text-lg md:text-xl text-gray-700">{value}</h4>
				<h6 className="mt-3 font-sans text-sm text-gray-400/80">{title}</h6>
			</div>
		</div>
	);
};
