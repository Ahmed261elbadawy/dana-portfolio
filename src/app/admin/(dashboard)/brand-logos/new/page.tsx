import { BrandLogoForm } from "../brand-logo-form";

export default function NewBrandLogoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md">Add brand logo</h1>
        <p className="mt-1 text-ink/60">
          Shown in the &ldquo;Brands I&apos;ve worked with&rdquo; grid on the
          homepage.
        </p>
      </div>
      <BrandLogoForm />
    </div>
  );
}
