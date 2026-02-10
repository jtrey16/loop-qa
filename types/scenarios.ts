/** A single test scenario definition. */
export type Scenario = {
  name: string;
  board?: string;     // optional: only needed when switching boards
  column: string;
  cardTitle: string;
  tags?: string[];
};

/** The full suite data loaded from scenarios.json. */
export type SuiteData = {
  credentials: { email: string; password: string };
  scenarios: Scenario[];
};