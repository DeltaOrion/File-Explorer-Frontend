import * as yup from "yup";
import { ValidationError } from "yup";

const disallowedCharacters = new Set<string>([
  ":",
  "*",
  "/",
  "\\",
  "?",
  '"',
  ".",
]);

export const fileNameSchema = yup
  .string()
  .required()
  .test({
    name: "Validate Name",
    test: (value, context) => {
      if (disallowedCharacters.has(value))
        return new ValidationError("Contains Invalid Characters");

      return true;
    },
  })
  .min(1)
  .max(255);

export const fileTypeSchema = yup.object().required();

export const dateModifiedSchema = yup.date().required().max(new Date());

export const fileSizeSchema = yup.number().integer().min(0);

export const fileSchema = yup.object().shape({
    name: fileNameSchema,
    type: fileTypeSchema,
    size: fileSizeSchema,
    lastModified: dateModifiedSchema,
});
