import { useEffect, useState } from "react";

import ProjectCard from "../components/ProjectCard";
import { listProjects } from "../projects";
import { STATUSES, statusLabel, type ProjectStatus, type ReviewProject } from "../types";

const risks = ["all", "low", "medium", "high", "unknown"] as const;

export default function Queue() {
  const [projects, setProjects] = useState<ReviewProject[]>([]);
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [risk, setRisk] = useState<(typeof risks)[number]>("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    listProjects()
      .then((rows) => {
        if (live) {
          setProjects(rows);
        }
      })
      .catch((caught: unknown) => {
        if (live) {
          setError(caught instanceof Error ? caught.message : "Could not load projects");
        }
      })
      .finally(() => {
        if (live) {
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, []);

  const visible = projects.filter((project) => {
    if (status !== "all" && project.status !== status) {
      return false;
    }
    if (risk !== "all" && project.risk !== risk) {
      return false;
    }
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-[1203px] px-4 py-8 md:px-10">
      <h1 className="text-6xl font-bold tracking-[-0.5px] text-[#1DBF73] md:text-8xl">Review</h1>
      <div className="mb-8 mt-6 flex flex-col gap-3">
        <FilterRow
          label="Status"
          value={status}
          options={["all", ...STATUSES]}
          onChange={(next) => setStatus(next as ProjectStatus | "all")}
        />
        <FilterRow label="Risk" value={risk} options={[...risks]} onChange={(next) => setRisk(next as (typeof risks)[number])} />
        <p className="text-sm text-black/50">{visible.length} shown</p>
      </div>
      {error ? <p className="mb-4 text-sm text-[#E6453A]">{error}</p> : null}
      <div className="rounded-lg bg-white p-2 shadow-xl">
        <div className="grid gap-2">
          {loading ? <p className="py-12 text-center text-black/40">Loading projects</p> : null}
          {!loading && visible.length === 0 ? (
            <p className="py-12 text-center text-black/40">No projects match these filters.</p>
          ) : null}
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-black/70">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-3 py-1 text-xs capitalize ${
            value === option
              ? "border-[#1DBF73] bg-[#1DBF73] text-white"
              : "border-[#1DBF73] bg-white text-[#1DBF73] hover:border-[#17A665]"
          }`}
        >
          {option === "all" ? "All" : option === "unknown" ? "No report" : statusLabel(option)}
        </button>
      ))}
    </div>
  );
}
