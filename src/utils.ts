export function capitalizeFirstLetter(text: string) {
  const textArr = text.split(" ");
  return textArr
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
