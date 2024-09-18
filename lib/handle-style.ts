import { toSnakeCase } from "./strings";
import type { Context } from "./template-builder";

export const handleStyle = (context: Context) => {
  const style = Object.entries(context.value)
    .map(([styleKey, styleValue]) => {
      return `${toSnakeCase(styleKey)}: ${typeof styleValue === "function" ? styleValue() : styleValue};`;
    })
    .join(" ");
  context.element.setAttribute(context.key, style);
};
