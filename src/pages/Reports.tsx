
// Add the necessary fix to handle the ValueType in the Reports page, specifically adding a type guard before using .toFixed.
// This is a partial update focusing only on the problematic part:

const tooltipFormatter = (value: any) => {
  // Check if value is a number before calling toFixed
  if (typeof value === 'number') {
    return `${value.toFixed(2)}%`;
  }
  // If it's not a number, just return it as a string
  return `${value}`;
};
