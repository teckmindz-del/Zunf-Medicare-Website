import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveRight, Phone, MessageSquare, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SEO } from "@/components/seo";

const galleryImages = Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    url: `/gallery/a${i + 1}.jpeg`,
    title: `Medical Camp Action ${i + 1}`,
    description: "ZUNF Medicare in the field providing quality diagnostic services."
}));

export default function AboutPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <SEO
                title="About Zunf Medicare | Trusted Healthcare Services & Book your tests"
                description="Learn about Zunf Medicare, a trusted healthcare provider offering quality medical services, diagnostic labs, and patient-focused solutions for better health outcomes."
            />
            <SiteHeader />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-slate-900 text-white">
                    <div className="absolute inset-0 z-0 opacity-20">
                        <img
                            src="/gallery/a1.jpeg"
                            alt="About Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="container relative z-10 mx-auto px-4">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                                Empowering Communities Through <span className="text-primary">Reliable Healthcare</span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                                ZUNF Medicare is dedicated to bringing world-class diagnostic services to your doorstep. From local medical camps to corporate screenings, we ensure quality care is accessible to everyone.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/contact">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                                        Get in Touch
                                        <MoveRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to="/services/labs">
                                    <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                                        Explore Tests
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery / Slideshow Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                                <Camera className="h-4 w-4" /> Our Gallery
                            </div>
                            <h2 className="text-4xl font-bold mb-4 tracking-tight">Medical Camps & Activities</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                A glimpse into our dedication to public health across various communities and organizations.
                            </p>
                        </div>

                        {/* Main Slideshow */}
                        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl aspect-video mb-12 border-8 border-white bg-white">
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={img.id}
                                    className={cn(
                                        "absolute inset-0 transition-opacity duration-1000",
                                        idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                                    )}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">{img.title}</h3>
                                        <p className="text-white/80">{img.description}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Controls */}
                            <div className="absolute bottom-4 right-8 z-20 flex gap-2">
                                {galleryImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={cn(
                                            "h-1.5 rounded-full transition-all duration-300",
                                            idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/50"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {galleryImages.slice(0, 12).map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={cn(
                                        "relative aspect-square rounded-xl overflow-hidden transition-all hover:scale-105",
                                        idx === currentSlide ? "ring-4 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <Card className="bg-primary text-primary-foreground p-12 rounded-[2rem] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative z-10 text-center max-w-2xl mx-auto">
                                <h2 className="text-4xl font-bold mb-6">Need a Medical Camp at Your Premises?</h2>
                                <p className="text-primary-foreground/80 mb-8 text-lg">
                                    We specialize in organizing health screenings for schools, corporations, and community centers. Reach out to our team today.
                                </p>
                                <Link to="/contact">
                                    <Button size="lg" className="bg-white text-primary hover:bg-slate-100">
                                        <Phone className="mr-2 h-4 w-4" /> Contact Us for Medical Camps
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
