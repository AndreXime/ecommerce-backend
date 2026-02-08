import { z } from "zod";

const SchemaPassword = z.string("PASSWORD must be a string").min(6, "PASSWORD must be at least 6 characters");
const SchemaName = z.string("NAME must be a string").min(1, "NAME must be at least 1 character");
const SchemaEmail = z.email("EMAIL must be a valid email").toLowerCase();

export { SchemaPassword, SchemaEmail, SchemaName };
