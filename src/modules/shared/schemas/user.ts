import { z } from "zod";

const SchemaPassword = z.string("Senha deve ser string").min(6, "Senha deve ter no minimo 6 caracteres");
const SchemaName = z.string("Nome deve ser string").min(1, "NAME must be at least 1 character");
const SchemaEmail = z.email("Email deve ser um email valido").toLowerCase();

export { SchemaPassword, SchemaEmail, SchemaName };
