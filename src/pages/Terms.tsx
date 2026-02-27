import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="py-8 md:py-12">
            <h1 className="font-accent text-3xl md:text-4xl font-black text-foreground mb-2">Terms of Service</h1>
            <p className="font-body text-muted-foreground text-sm">Last updated: February 2026</p>
          </div>

          <div className="prose prose-sm max-w-none font-body text-foreground space-y-6">
            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">1. Welcome to Naija Original</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Naija Original (naijaoriginal.ng), you agree to dey bound by these Terms of Service. If you no agree with any part of these terms, abeg no use our platform.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">2. Products and Authenticity</h2>
              <p className="text-muted-foreground leading-relaxed">
                All Naija Original products come with QR-verified authenticity. Each product carry unique code wey you fit scan to verify say e genuine. We guarantee say every product wey we sell na original — no fake, no counterfeit.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Product images dey for illustration purposes and fit vary slightly from the actual item</li>
                <li>Limited edition items dey subject to availability</li>
                <li>Prices dey quoted in Nigerian Naira (₦) and fit change without prior notice</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">3. Orders and Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you place order, you dey make offer to buy. We fit accept or decline the order at our discretion. Payment go dey processed through Paystack and other approved payment methods.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>All payments dey in Nigerian Naira (₦)</li>
                <li>Order confirmation no mean say we don accept the order until payment dey verified</li>
                <li>We reserve the right to cancel orders wey we suspect say na fraudulent</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                We dey ship within Nigeria and internationally. Delivery times dey estimated and fit vary based on your location. Shipping costs go dey calculated at checkout based on your delivery address.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                <li>Free shipping dey available for orders above ₦50,000</li>
                <li>Risk of loss pass to you once the carrier collect the package</li>
                <li>You fit track your order using your order number on our platform</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">5. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                You fit return unused and unworn items within 14 days of delivery for full refund. Items must dey in their original packaging with all tags attached. Limited edition items no dey eligible for return unless dem get defect.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">6. QR Ownership Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you scan and register ownership of a product, the registration dey linked to your account. Ownership registration dey for verification purposes and no transfer any intellectual property rights. If you sell the product, the new owner fit re-register ownership.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">7. Corporate & Custom Orders</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer customization services for companies, NGOs, and government organizations. Custom orders dey subject to separate agreements and pricing. Use our estimate calculator to get rough pricing, but note say final quotes fit differ based on specific requirements.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Naija Original no go dey liable for any indirect, incidental, or consequential damages wey arise from your use of our platform or products. Our maximum liability no go exceed the amount you paid for the specific product or service in question.
              </p>
            </section>

            <section className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-accent text-lg font-bold text-foreground mb-3">9. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For any questions about these terms, reach us at{" "}
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

export default Terms;
