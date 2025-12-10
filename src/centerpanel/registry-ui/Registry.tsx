import React, { useEffect, useState } from "react";
import CohortFilters from "./CohortFilters";
import Table from "./Table";
import { RegistryProvider, ensureSeed, useRegistry, useAutoPopulateDemoOnce } from "../registry/state";
import Timeline from "../registry/Timeline";

export default function RegistryView({ children }: { children?: React.ReactNode }) {
  useEffect(() => { ensureSeed(); }, []);
  return (
    <RegistryProvider>
      {children}
    </RegistryProvider>
  );
}

export function RegistryLeft() { return <CohortFilters />; }
export function RegistryMain() {
  const { state } = useRegistry();

  useAutoPopulateDemoOnce();
  const [showDetail, setShowDetail] = useState(false);

  return showDetail && state.selectedPatientId ? (
    <Timeline onBack={() => setShowDetail(false)} />
  ) : (
    <Table onOpen={() => setShowDetail(true)} />
  );
}

