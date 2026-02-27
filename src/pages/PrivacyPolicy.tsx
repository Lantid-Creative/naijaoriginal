import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="py-8 md:py-12">
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">Privacy Policy</h1>
            <p className="font-body text-muted-foreground text-sm">Last updated: February 2026</p>
          </div>

          <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">1. Wetin We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you use Naija Original, we fit collect the following information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Your name, email address, and phone number wey you provide during registration</li>
                <li>Shipping address and billing information for order processing</li>
                <li>Product authentication and QR code scan data</li>
                <li>Device information and browsing activity on our platform</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">2. How We Use Your Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                We dey use your information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Process and deliver your orders</li>
                <li>Verify product authenticity through our QR system</li>
                <li>Send you order updates and important notifications</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">3. Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                We take your data security seriously. We use industry-standard encryption and security measures to protect your personal information. Your payment details dey processed through secure third-party payment providers (Paystack) — we no store your card details directly.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">4. Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We no go sell your personal data to third parties. We fit share your information only with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Shipping partners to deliver your orders</li>
                <li>Payment processors to handle transactions</li>
                <li>Service providers wey help us run the platform</li>
                <li>Law enforcement if required by law</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You get the right to access, update, or delete your personal data at any time through your account settings. If you want make we delete your account entirely, send email to{" "}
                <a href="mailto:howfar@naijaoriginal.com" className="text-primary hover:underline">howfar@naijaoriginal.com</a>.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">6. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to keep you logged in, remember your preferences, and improve your experience. By using our platform, you agree to the use of cookies.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you get any question about this Privacy Policy, reach us at{" "}
                <a href="mailto:howfar@naijaoriginal.com" className="text-primary hover:underline">howfar@naijaoriginal.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
