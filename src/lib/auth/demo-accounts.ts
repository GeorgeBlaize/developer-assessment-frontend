import type { Role } from "@/types/api";

export interface DemoAccount {
  role: Role;
  title: string;
  description: string;
  email: string;
  password: string;
}

/** Seeded evaluation accounts (see backend prisma/seed.ts). Not personal credentials. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    title: "Admin",
    description: "Users, plans, audit trail & platform analytics",
    email: "admin@codeassess.dev",
    password: "Admin@12345",
  },
  {
    role: "COMPANY",
    title: "Company",
    description: "Build assessments, invite, grade & subscribe",
    email: "company@demo.dev",
    password: "Company@12345",
  },
  {
    role: "CANDIDATE",
    title: "Candidate",
    description: "Accept invites, take timed tests, see results",
    email: "candidate@demo.dev",
    password: "Candidate@12345",
  },
];
