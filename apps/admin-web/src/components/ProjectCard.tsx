import { Link } from "react-router-dom";

import { statusLabel, type ReviewProject } from "../types";

export default function ProjectCard({ project }: { project: ReviewProject }) {
  const title = project.organisationName || project.species || "Untitled project";
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-lg bg-gray-100 p-3 sm:p-4 lg:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-black sm:text-xl">{title}</h2>
          <p className="truncate font-mono text-xs text-black/50 sm:text-sm">{project.id}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-xs font-medium text-black/80 sm:text-sm">
            {project.risk === "unknown" ? "no report" : project.risk}
          </span>
          <span className="rounded-full border border-[#1DBF73] bg-[#ACEEC7] px-2 py-1 text-xs font-medium capitalize text-[#1DBF73] sm:px-3 sm:text-sm">
            {statusLabel(project.status)}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Species" value={project.species || "—"} />
        <Tile label="Trees" value={project.treeCount || "—"} />
        <Tile label="Region" value={project.region || "—"} />
      </div>
    </Link>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-sm font-medium text-black/70">{label}</p>
      <p className="truncate text-sm text-black/80">{value}</p>
    </div>
  );
}
