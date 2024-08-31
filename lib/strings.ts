const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace("_", "-");
};
const toPascalCase = (str: string) =>
  (str.match(/[a-zA-Z0-9]+/g) || [])
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join("");
const toCamelCase = (str: string) => {
  const pascaled = toPascalCase(str);
  return pascaled.charAt(0).toLowerCase() + pascaled.slice(1);
};

export { toSnakeCase, toPascalCase, toCamelCase };
