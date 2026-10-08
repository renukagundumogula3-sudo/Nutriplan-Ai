import { useState } from "react";
import api from "../api/axios";
import { Camera, Loader2, Sparkles } from "lucide-react";

export default function ImageUpload({ onScan }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post(
        "/recipes/vision/snap",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("🔍 Debugging ImageUpload:");
      console.log("  - onScan type:", typeof onScan);
      console.log("  - res.data:", res.data);

      if (res.data?.ingredients) {
        if (typeof onScan === "function") {
          console.log("✅ Executing onScan...");
          onScan(res.data.ingredients);
        } else {
          console.error("❌ CRITICAL: onScan prop is missing!");
          alert("Error: Feature not configured correctly (onScan missing).");
        }
      } else {
        console.warn("❌ Missing ingredients in response");
        alert("No ingredients detected.");
      }
    } catch (err) {
      console.error("Image upload failed:", err);

      const msg =
        err.response?.data?.message ||
        "Failed to analyze image. Check backend.";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        disabled={loading}
      />


      {/* Upload Box */}
      <div
        className={`
          relative flex min-h-[150px] flex-col items-center justify-center
          rounded-2xl border-2 border-dashed
          p-7 text-center
          transition-all duration-300
          cursor-pointer
          ${
            loading
              ? "border-orange-300/20 bg-orange-500/5"
              : "border-white/15 bg-white/[0.025] hover:border-orange-400/60 hover:bg-orange-500/[0.06]"
          }
        `}
      >

        {/* Icon */}
        <div
          className={`
            mb-3 flex h-14 w-14 items-center justify-center
            rounded-2xl transition-all duration-300
            ${
              loading
                ? "bg-orange-500/10"
                : "bg-orange-500/10 group-hover:bg-orange-500 group-hover:scale-105"
            }
          `}
        >

          {loading ? (
            <Loader2
              className="animate-spin text-orange-400"
              size={27}
            />
          ) : (
            <Camera
              className="text-orange-400 group-hover:text-black transition-colors duration-300"
              size={27}
            />
          )}

        </div>


        {/* Main text */}
        <p className="font-semibold text-gray-200">
          {loading
            ? "Analyzing your kitchen..."
            : "Snap & Cook"}
        </p>


        {/* Description */}
        <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
          {loading
            ? "AI is identifying your ingredients"
            : "Upload your ingredients"}
        </p>


        {/* Small AI indicator */}
        {!loading && (
          <div className="mt-3 flex items-center gap-1.5 text-[7px] font-medium uppercase tracking-wider text-orange-400/80">
            <Sparkles size={8} />
            AI Vision
          </div>
        )}

      </div>

    </div>
  );
}