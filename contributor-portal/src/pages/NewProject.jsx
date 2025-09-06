import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NewProject() {
  const [form, setForm] = useState({
    before_images: [],
    after_images: [],
    tree_type: "",
    area: "",
    land_record: null,
    mou: null,
    org_name: "",
    reg_no: "",
    csr_budget: "",
    community_name: "",
    land_proof: null,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role;

  // Get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          }));
        },
        () => setError("Location access denied")
      );
    }
  }, []);

  // File uploader -> uploads to backend immediately
  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    return data.url;
  };

  // Handle multiple file uploads (with validation for before_images)
  const handleFiles = async (e, field) => {
    const files = Array.from(e.target.files);

    // Special check only for before_images
    if (field === "before_images" && files.length < 3) {
      setError("Please select at least 3 before plantation images.");
      return;
    }

    setError(""); // clear old errors
    const urls = await Promise.all(files.map(uploadFile));

    setForm((prev) => ({
      ...prev,
      [field]: urls,
    }));
  };

  // Single file upload (land record, MoU, etc.)
  const handleSingleFile = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadFile(file);
      setForm((prev) => ({
        ...prev,
        [field]: url,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Double-check (failsafe)
    if (!form.before_images || form.before_images.length < 3) {
      setError("Please upload at least 3 before plantation images.");
      return;
    }

    const projectData = {
      wallet_address: user.wallet_address,
      role,
      tree_type: form.tree_type,
      area: form.area,
      location: form.location,
      before_images: form.before_images,
      land_record: form.land_record,
      mou: form.mou,
      org_name: form.org_name,
      reg_no: form.reg_no,
      csr_budget: form.csr_budget,
      community_name: form.community_name,
      land_proof: form.land_proof,
    };

    const res = await fetch("http://localhost:5000/projects/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Project created:", data);
      navigate("/projects");
    } else {
      setError(data.error || "Failed to submit project");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Submit Plantation Project ({role})
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg space-y-4"
      >
        {/* Before Images */}
        <label className="block font-semibold">
          Before Plantation Images (min 3):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e, "before_images")}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {form.before_images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Before ${idx + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>

        {/* Tree Type */}
        <input
          type="text"
          placeholder="Tree/Plant Type"
          className="w-full border p-2 rounded"
          onChange={(e) => setForm({ ...form, tree_type: e.target.value })}
          required
        />

        {/* Area */}
        <input
          type="number"
          placeholder="Area Covered (in acres)"
          className="w-full border p-2 rounded"
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          required
        />

        {/* Role-specific fields */}
        {role === "individual" && (
          <div>
            <label className="block font-semibold">Upload Land Record:</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleSingleFile(e, "land_record")}
            />
          </div>
        )}

        {role === "ngo" && (
          <>
            <input
              type="text"
              placeholder="Organization Name"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) => setForm({ ...form, org_name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Registration Number"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
              required
            />
            <label className="block font-semibold">Upload MoU:</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleSingleFile(e, "mou")}
            />
          </>
        )}

        {role === "corporate" && (
          <>
            <input
              type="number"
              placeholder="CSR Budget (in INR)"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) =>
                setForm({ ...form, csr_budget: e.target.value })
              }
              required
            />
            <label className="block font-semibold">
              Upload CSR/MoU Document:
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleSingleFile(e, "mou")}
            />
          </>
        )}

        {role === "community" && (
          <>
            <input
              type="text"
              placeholder="Community Name"
              className="w-full border p-2 rounded mb-3"
              onChange={(e) =>
                setForm({ ...form, community_name: e.target.value })
              }
              required
            />
            <label className="block font-semibold">Upload Land Proof:</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleSingleFile(e, "land_proof")}
            />
          </>
        )}

        {/* Location */}
        <p>
          <strong>Location:</strong>{" "}
          {form.location
            ? `${form.location.lat}, ${form.location.lng}`
            : "Fetching..."}
        </p>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Submit Project
        </button>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </form>
    </div>
  );
}
