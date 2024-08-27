const toSnakeCase = (str: string) => {
  return str
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace("_", "-");
};

export { toSnakeCase };
