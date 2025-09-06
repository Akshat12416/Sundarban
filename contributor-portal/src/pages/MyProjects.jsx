import { useState, useEffect } from "react";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:5000/projects/${user.wallet_address}`
      );
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-400";
      case "awaiting_after_images":
        return "bg-orange-100 text-orange-700 border-orange-400";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-400";
    }
  };

const uploadAfterImages = async (proj, files) => {
  const fileArray = Array.from(files);

  if (fileArray.length < 3) {
    alert("Please upload at least 3 after plantation images.");
    return;
  }

  const urls = await Promise.all(
    fileArray.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      return data.url;
    })
  );

  await fetch(
    `http://localhost:5000/projects/${proj.project_id}/after-images`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ after_images: urls }),
    }
  );

  fetchProjects(); // refresh
};


  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6 relative">
      <h1 className="text-2xl font-bold mb-4">My Plantation Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-600">No projects submitted yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((proj) => {
            const beforeImgs = proj.before_images || [];
            const afterImgs = proj.after_images || [];

            return (
              <div key={proj._id} className="bg-white shadow-md p-4 rounded-lg border">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">Project</h2>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                      proj.status
                    )}`}
                  >
                    {proj.status?.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-2">
                  Project ID: <span className="font-mono">{proj.project_id}</span>
                </p>

                <p className="text-sm text-gray-500 mb-2">
                  Location: {proj.location?.lat}, {proj.location?.lng}
                </p>

                <p className="text-sm text-gray-600 mb-2">
                  Trees: {proj.tree_type || "-"} | Area: {proj.area || "-"} acres
                </p>

                {/* Before Images */}
                {beforeImgs.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Before Plantation
                    </h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {beforeImgs.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Before ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                          onClick={() => setPreviewImg(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* After Images */}
                {afterImgs.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      After Plantation
                    </h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {afterImgs.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`After ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                          onClick={() => setPreviewImg(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload After Images if awaiting */}
                {proj.status === "awaiting_after_images" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Upload After Plantation Images:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={(e) => uploadAfterImages(proj, e.target.files)}
                      className="block w-full text-sm text-gray-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Preview"
            className="max-w-full max-h-full rounded shadow-lg"
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setPreviewImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
