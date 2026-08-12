export const metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-lg">
      <h1 className="text-4xl font-bold font-heading mb-6">Privacy Policy</h1>
      <p>
        Your privacy is important to us. This policy explains how we collect, use, and protect
        your information when you use our website and services.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly (such as name, email, and booking details)
        and information collected automatically through cookies and analytics.
      </p>
      <h2>How We Use Information</h2>
      <p>
        We use your information to process reservations, improve our services, and communicate
        with you about your stay and offers.
      </p>
      <h2>Contact</h2>
      <p>For any privacy-related questions, please reach out via our contact page.</p>
    </div>
  );
}
