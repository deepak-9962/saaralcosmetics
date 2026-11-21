import PurchaseLimitForm from "@/components/admin/limits/PurchaseLimitForm";

export const metadata = {
  title: "New Purchase Limit Rule — Saaral Admin",
};

export default function NewPurchaseLimitPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-[30px] text-on-surface">New Purchase Limit</h1>
        <p className="font-body text-[14px] text-on-surface-variant mt-1">
          Set maximum order and periodic purchase caps across products, categories, combos, or store-wide.
        </p>
      </div>
      <PurchaseLimitForm />
    </div>
  );
}
