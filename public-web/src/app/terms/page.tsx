export const metadata = {
  title: 'Terms of Service',
  description: 'Our terms of service',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-lg">
      <h1 className="text-4xl font-bold font-heading mb-6">Terms of Service</h1>
      <p>
        By accessing or using our website and services, you agree to the following terms.
      </p>
      <h2>Reservations</h2>
      <p>
        Reservations are subject to availability and confirmation. Rates are per room, per night,
        and exclude applicable taxes unless stated otherwise.
      </p>
      <h2>Cancellation</h2>
      <p>
        Free cancellation is available up to 24 hours before the scheduled check-in time.
      </p>
      <h2>Liability</h2>
      <p>
        We are not liable for any loss or damage to personal belongings during your stay.
      </p>
    </div>
  );
}
