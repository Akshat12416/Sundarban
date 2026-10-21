import { createContext, useContext, type ReactNode } from "react";

import { fakeSource } from "./fake";
import type { DataSource } from "./types";

const DataContext = createContext<DataSource>(fakeSource);

export function DataProvider({ children }: { children: ReactNode }) {
  return <DataContext.Provider value={fakeSource}>{children}</DataContext.Provider>;
}

export function useData(): DataSource {
  return useContext(DataContext);
}
