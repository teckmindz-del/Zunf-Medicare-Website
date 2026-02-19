import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Phone, Mail, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, Suspense } from "react";
import { API_BASE_URL } from '@/config/api';
import { createLead } from '@/lib/api';
import { useToast } from "@/contexts/toast-context";
import { SEO } from "@/components/seo";

function ContactForm() {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service") || "";
  const programName = searchParams.get("program") || "";

  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createLead({
        ...formData,
        serviceType: serviceType || "General Inquiry",
        programName: programName ? decodeURIComponent(programName) : undefined,
      });

      showToast("Thank you! Your inquiry has been submitted. Our team will contact you soon.", "success");
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      showToast("Failed to submit inquiry. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SEO
        title="Contact Zunf Medicare | Book Appointment & Get Support"
        description="Contact Zunf Medicare for appointments, medical services, and healthcare support. Reach our team for reliable assistance and quick responses to your needs."
        canonicalPath="/contact"
      />
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Back Button */}
          <Link
            to={serviceType ? `/services/${serviceType}` : "/"}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Service Inquiry
            </h1>
            <p className="text-muted-foreground">
              Please provide your details below. Your request will be saved and our team will get back to you shortly.
            </p>
          </div>

          {/* Contact Form */}
          <Card className="p-6 md:p-8 border-primary/20">
            {(serviceType || programName) && (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Service Selected</p>
                {serviceType && (
                  <p className="text-sm text-muted-foreground">
                    Type: <span className="font-medium text-foreground capitalize">{serviceType.replace(/-/g, " ")}</span>
                  </p>
                )}
                {programName && (
                  <p className="text-sm text-muted-foreground">
                    Program: <span className="font-medium text-foreground">{decodeURIComponent(programName)}</span>
                  </p>
                )}
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Send className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Inquiry Received</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. We have received your inquiry regarding
                  <span className="font-semibold text-foreground"> {serviceType ? serviceType.replace(/-/g, " ") : "our services"}</span>.
                  One of our representatives will contact you shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message / Requirements</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your requirements or any questions you have..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="mt-1 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:opacity-90 py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            )}

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Or contact us directly:</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">03090622004</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground">info@zunfmedicare.com</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}


