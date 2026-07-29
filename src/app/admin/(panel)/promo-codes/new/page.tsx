import PromoCodeForm from "@/components/admin/promo/PromoCodeForm";

export const metadata = { title: "New Promo Code — Saaral Admin" };

export default function NewPromoCodePage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-[30px] text-on-surface">New Promo Code</h1>
        <p className="font-body text-[14px] text-on-surface-variant mt-1">
          Create a new discount or promo code for your customers.
        </p>
      </div>
      <PromoCodeForm />
    </div>
  );
}
