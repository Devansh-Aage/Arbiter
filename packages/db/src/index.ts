import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient();

// Export types
export * from "./types";
