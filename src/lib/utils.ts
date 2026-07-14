import clsx from "clsx";

export const cn = (...values: Array<string | false | null | undefined>) =>
  clsx(values);

export const formatCurrency = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
