import { db as srcDb, isDbConfigured as srcIsDbConfigured } from "../src/db/index.ts";

export const db = srcDb;
export const isDbConfigured = srcIsDbConfigured;

