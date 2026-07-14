import { PanelCard } from "@/components/ui/panel-card";

export default function KycPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">KYC Verification</h2>

      <PanelCard
        title="Required Documents"
        subtitle="Aadhaar Card, PAN Card, and Selfie are mandatory"
      >
        <ul className="mb-5 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Aadhaar Card (Front & Back)</li>
          <li>PAN Card</li>
          <li>Live Selfie (clear face image)</li>
        </ul>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Aadhaar Card Upload</label>
            <input className="input-base" type="file" accept="image/*,.pdf" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">PAN Card Upload</label>
            <input className="input-base" type="file" accept="image/*,.pdf" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Selfie Upload</label>
            <input className="input-base" type="file" accept="image/*" required />
          </div>

          <button className="btn-primary px-4 py-2 text-sm font-semibold">
            Submit KYC Documents
          </button>
        </form>
      </PanelCard>
    </div>
  );
}
