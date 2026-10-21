import { bytesToHex, hexToBytes, sha256, verifyMerkleProof, type ProofStep } from "@sundarban/cv-crypto";
import { useState } from "react";

import { verifierBase } from "../api";
import deployment from "../../../../packages/contract-abi/deployment.json";
import abi from "../../../../packages/contract-abi/CarbonRegistry.abi.json";

type Proof = {
  dataHash: string;
  evidenceRoot: string;
  parcelHash: string;
  reportHash: string;
  leaf?: string;
  proof?: { side: "left" | "right"; sibling: string }[];
};

const rpc = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export default function VerifyPage() {
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);

  async function check() {
    setOk(null);
    const base = verifierBase();
    const photo = file ? bytesToHex(sha256(new Uint8Array(await file.arrayBuffer()))) : "";
    const query = photo ? `?sha256=${photo}` : "";
    const response = await fetch(`${base}/v1/public/projects/${projectId}/proof${query}`);
    const body = (await response.json()) as Proof & { detail?: string };
    if (!response.ok) {
      throw new Error(body.detail || "This project has no public proof");
    }
    const { Contract, formatUnits, JsonRpcProvider } = await import("ethers");
    const provider = new JsonRpcProvider(rpc);
    const registry = new Contract(deployment.address, abi, provider);
    const chainId = await registry.projectIdByDataHash(body.dataHash);
    if (chainId === 0n) {
      setOk(false);
      setMessage("No on-chain record for this project.");
      return;
    }
    const onchain = await registry.getProject(chainId);
    const root = String(onchain.evidenceRoot).toLowerCase();
    if (root !== body.evidenceRoot.toLowerCase()) {
      setOk(false);
      setMessage("The published evidence root does not match Sepolia.");
      return;
    }
    const summary = `On-chain credits ${formatUnits(onchain.credits, 18)} · root ${root.slice(0, 10)}…`;
    if (!file || !body.leaf || !body.proof) {
      setOk(true);
      setMessage(`${summary}. Add a photo to check it against the tree.`);
      return;
    }
    const steps: ProofStep[] = body.proof.map((step) => ({
      side: step.side,
      sibling: hexToBytes(step.sibling.slice(2)),
    }));
    const matched = verifyMerkleProof(hexToBytes(body.leaf.slice(2)), steps, hexToBytes(root.slice(2)));
    setOk(matched);
    setMessage(matched ? `${summary}. This photo is in the on-chain record.` : `${summary}. This photo was rejected.`);
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
      <h1 className="text-5xl font-bold text-[#1DBF73]">Verify a credit</h1>
      <p className="text-black/80">No account is required. The page checks hashes and the Sepolia record only.</p>
      <label className="text-sm text-black/70">
        Project id
        <input
          value={projectId}
          onChange={(event) => setProjectId(event.target.value.trim())}
          className="mt-1 w-full rounded-xl border border-[#1DBF73] p-3 font-mono text-sm"
        />
      </label>
      <label className="text-sm text-black/70">
        Photo, optional
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="button"
        className="w-fit rounded-full bg-[#1DBF73] px-5 py-2 font-medium text-white"
        onClick={() => {
          check().catch((caught: unknown) => {
            setOk(false);
            setMessage(caught instanceof Error ? caught.message : "Check failed");
          });
        }}
      >
        Check
      </button>
      {message ? <p className={ok ? "text-sm text-[#1DBF73]" : "text-sm text-[#E6453A]"}>{message}</p> : null}
    </section>
  );
}
