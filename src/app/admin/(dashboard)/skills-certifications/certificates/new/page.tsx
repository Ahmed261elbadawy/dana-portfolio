import { CertificateForm } from "../certificate-form";

export default function NewCertificatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add certificate</h1>
        <p className="mt-1 text-ink/60">
          Shown in the certificates row on the homepage.
        </p>
      </div>
      <CertificateForm />
    </div>
  );
}
