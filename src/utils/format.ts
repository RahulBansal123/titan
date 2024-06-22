export const formatNumber = (value: number) => {
    return Intl.NumberFormat("en-US", {
        style: "decimal",
        maximumFractionDigits: 4,
    }).format(value);
}