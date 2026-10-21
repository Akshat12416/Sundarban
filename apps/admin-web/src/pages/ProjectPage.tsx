import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { evidenceUrl, verifierBase } from "../api";
import { useSession } from "../auth";
import { latestReport, listEvidence, listProjects, recordDecision } from "../projects";
import { statusLabel, type EvidenceItem, type ProjectStatus, type ReviewProject, type RiskReport } from "../types";

export default function ProjectPage() {
  const { projectId = "" } = useParams();
  const [project, setProject] = useState<ReviewProject | null>(null);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([listProjects(), latestReport(projectId), listEvidence(projectId)])
      .then(([projects, foundReport, items]) => {
        if (!live) {
          return;
        }
        const found = projects.find((item) => item.id === projectId) ?? null;
        setProject(found);
        setMissing(!found);
        setReport(foundReport);
        setEvidence(items);
        setNote(found?.adminNote ?? "");
      })
      .catch((caught: unknown) => {
        if (live) {
          setError(caught instanceof Error ? caught.message : "Could not load the project");
        }
      });
    return () => {
      live = false;
    };
  }, [projectId]);

  async function decide(status: ProjectStatus) {
    if (status === "needs_more_evidence" && !note.trim()) {
      setError("A note is required when requesting more evidence.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await recordDecision(projectId, status, note.trim());
      setProject((current) => (current ? { ...current, status, adminNote: note.trim() } : current));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record the decision");
    } finally {
      setBusy(false);
    }
  }

  if (missing) {
    return (
      <div className="mx-auto max-w-[1203px] px-4 py-8">
        <p>Project not found.</p>
        <Link to="/" className="text-[#1DBF73]">Back to the queue</Link>
      </div>
    );
  }

  if (!project) {
    return <p className="px-4 py-8 text-black/50">Loading project</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1203px] flex-col gap-6 px-4 py-8 md:px-10">
      <Link to="/" className="text-sm font-medium text-[#1DBF73]">Review queue</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold text-black">{project.species || project.organisationName || "Project"}</h1>
        <span className="rounded-full bg-[#ACEEC7] px-3 py-1 text-sm font-medium capitalize text-[#1DBF73]">
          {statusLabel(project.status)}
        </span>
      </div>
      <p className="font-mono text-sm text-black/50">{project.id}</p>

      <section className="grid gap-3 rounded-lg bg-white p-4 shadow-xl sm:grid-cols-2">
        <Field label="Species" value={project.species} />
        <Field label="Trees" value={project.treeCount} />
        <Field label="Acres" value={project.areaAcres} />
        <Field label="Hectares" value={project.areaHa} />
        <Field label="Region" value={project.region} />
        <Field label="Account" value={project.kind} />
        <Field label="Organisation" value={project.organisationName} />
        <Field label="Organisation id" value={project.organisationId} />
        <Field label="Document" value={[project.documentKind, project.documentName].filter(Boolean).join(" · ")} />
        <Field
          label="Parcel"
          value={
            project.parcel
              ? `${project.parcel.latitude ?? ""}, ${project.parcel.longitude ?? ""} · ${project.parcel.radiusM ?? ""} m`
              : ""
          }
        />
        <p className="sm:col-span-2 text-sm text-black/80">{project.description || "No description"}</p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Evidence</h2>
        {evidence.length === 0 ? <p className="text-sm text-black/50">No evidence records.</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-base font-bold">Risk report</h2>
        {report ? <ReportView report={report} /> : <p className="text-sm text-black/50">No report has been written for this project.</p>}
      </section>

      {project.status === "approved" || project.status === "credited" ? (
        <IssuePanel projectId={project.id} />
      ) : null}

      <section className="rounded-lg bg-white p-4 shadow-xl">
        <h2 className="mb-3 text-base font-bold">Decision</h2>
        <label className="mb-3 block text-sm text-black/70">
          Note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#1DBF73] p-3 text-sm"
            rows={3}
          />
        </label>
        {error ? <p className="mb-3 text-sm text-[#E6453A]">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <DecisionButton label="Approve" disabled={busy} onClick={() => void decide("approved")} />
          <DecisionButton label="Reject" disabled={busy} onClick={() => void decide("rejected")} />
          <DecisionButton label="Request more evidence" disabled={busy} onClick={() => void decide("needs_more_evidence")} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium text-black/70">{label}. </span>
      <span>{value || "—"}</span>
    </p>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  return (
    <article className="rounded-xl border border-[#1DBF73] bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium capitalize">{item.kind || "evidence"}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.attested ? "bg-[#ACEEC7] text-[#1DBF73]" : "bg-[#FECACA] text-[#E6453A]"}`}>
          {item.attested ? "Attested" : "Not attested"}
        </span>
      </div>
      <p className="truncate font-mono text-xs text-black/50">{item.sha256}</p>
      <p className="text-xs text-black/50">{item.capturedAt}</p>
      {item.kind !== "document" ? (
        <button
          type="button"
          className="mt-2 text-sm font-medium text-[#1DBF73]"
          onClick={() => {
            setError("");
            evidenceUrl(item.id).then(setUrl).catch((caught: unknown) => {
              setError(caught instanceof Error ? caught.message : "Could not open the file");
            });
          }}
        >
          Open photo
        </button>
      ) : null}
      {error ? <p className="mt-1 text-xs text-[#E6453A]">{error}</p> : null}
      {url ? <img src={url} alt="" className="mt-2 h-24 w-full rounded-xl object-cover" /> : null}
    </article>
  );
}

function ReportView({ report }: { report: RiskReport }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Risk <strong className="capitalize">{report.overall_risk || "—"}</strong>
        {" · "}
        Recommendation <strong>{report.recommendation || "—"}</strong>
      </p>
      <p className="break-all font-mono text-xs text-black/50">{report.report_hash}</p>
      {report.agent_outputs.length === 0 ? <p className="text-sm text-black/50">The report has no agent outputs.</p> : null}
      {report.agent_outputs.map((agent) => (
        <article key={`${agent.agent}-${agent.version}`} className="rounded-lg bg-[#EDFCF3] p-3">
          <h3 className="font-bold">{agent.agent || "Agent"} <span className="font-normal text-black/50">{agent.version}</span></h3>
          <p className="text-sm capitalize">Decision {agent.decision || "—"} · score {agent.score} · confidence {agent.confidence}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {agent.findings.map((finding, index) => (
              <li key={`${finding.type}-${index}`} className="text-sm">
                <span className="font-medium">{finding.type}. </span>
                {finding.explanation}
                {finding.evidence ? <span className="block font-mono text-xs text-black/50">{finding.evidence}</span> : null}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

type SealPayload = {
  owner: string;
  dataHash: string;
  evidenceRoot: string;
  parcelHash: string;
  reportHash: string;
  credits: string;
  contract: string;
};

function IssuePanel({ projectId }: { projectId: string }) {
  const { user } = useSession();
  const [owner, setOwner] = useState("");
  const [seal, setSeal] = useState<SealPayload | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function token(): Promise<string> {
    if (!user) {
      throw new Error("Sign in as an admin first");
    }
    return user.getIdToken();
  }

  async function sealProject() {
    setError("");
    const response = await fetch(`${verifierBase()}/v1/projects/${projectId}/seal`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ owner }),
    });
    const body = (await response.json()) as SealPayload & { detail?: string };
    if (!response.ok) {
      throw new Error(body.detail || "Seal failed");
    }
    setSeal(body);
    setMessage(`Sealed. Credits ${body.credits}`);
  }

  async function register() {
    if (!seal) {
      return;
    }
    const ethereum = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!ethereum) {
      throw new Error("MetaMask is not available");
    }
    const { BrowserProvider, Contract, parseUnits } = await import("ethers");
    const abi = (await import("../../../../packages/contract-abi/CarbonRegistry.abi.json")).default;
    const provider = new BrowserProvider(ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new Contract(seal.contract, abi, signer);
    const tx = await contract.registerProject(
      seal.owner,
      seal.dataHash,
      seal.evidenceRoot,
      seal.parcelHash,
      seal.reportHash,
      parseUnits(seal.credits, 18),
    );
    setMessage(`Submitted ${tx.hash}`);
    const receipt = await tx.wait();
    const response = await fetch(`${verifierBase()}/v1/chain/confirm`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, txHash: receipt?.hash || tx.hash }),
    });
    const body = (await response.json()) as { chainState?: string; detail?: string };
    if (!response.ok) {
      throw new Error(body.detail || "Confirm failed");
    }
    setMessage(`Chain state ${body.chainState} · ${receipt?.hash || tx.hash}`);
  }

  return (
    <section className="rounded-lg bg-white p-4 shadow-xl">
      <h2 className="mb-3 text-base font-bold">Issue on Sepolia</h2>
      <label className="mb-3 block text-sm text-black/70">
        Owner address
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value.trim())}
          className="mt-1 w-full rounded-xl border border-[#1DBF73] p-3 font-mono text-sm"
          placeholder="0x"
        />
      </label>
      {error ? <p className="mb-3 text-sm text-[#E6453A]">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-black/70">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full bg-[#1DBF73] px-4 py-2 text-sm font-medium text-white"
          onClick={() => {
            sealProject().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Seal failed"));
          }}
        >
          Seal
        </button>
        <button
          type="button"
          disabled={!seal}
          className="rounded-full bg-[#1DBF73] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={() => {
            setError("");
            register().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Register failed"));
          }}
        >
          Register with MetaMask
        </button>
      </div>
    </section>
  );
}

function DecisionButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-[#1DBF73] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {label}
    </button>
  );
}
