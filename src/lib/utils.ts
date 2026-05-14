export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-LY-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
