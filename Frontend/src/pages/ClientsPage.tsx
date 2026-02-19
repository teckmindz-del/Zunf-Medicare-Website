import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const allClients = [
    { name: "Artemis", logo: "/artemis.jpeg" },
    { name: "Direct Pay", logo: "/directpay.png" },
    { name: "Elixs", logo: "/elixs.jpeg" },
    { name: "Enartifi", logo: "/enartifi.png" },
    { name: "Flaship", logo: "/flaship.jpeg" },
    { name: "Ilets", logo: "/ilets.jpeg" },
    { name: "Khelta Punjab", logo: "/kheltapunjab.png" },
    { name: "MOITT", logo: "/MOITT.jpeg" },
    { name: "NICL", logo: "/NICL.jpeg" },
    { name: "Punjab", logo: "/punjab.jpeg" },
    { name: "Relife", logo: "/relife.png" },
    { name: "Chughtai Lab", logo: "/chughtai.jpeg" },
    { name: "IDC", logo: "/idc.jpeg" },
    { name: "Biotech", logo: "/biotech.jpeg" },
    { name: "Dr Essa", logo: "/drEssa.jpeg" },
    { name: "Jinnah MRI", logo: "/jinnahMRI.jpeg" },
    { name: "Martin Dow", logo: "/martin.jpeg" },
    { name: "Google", logo: "/google.jpeg" },
    { name: "Ignite", logo: "/ignite.jpeg" },
    { name: "Ayzal", logo: "/ayzal.jpeg" },
    { name: "Client 1", logo: "/client-1.jpeg" },
    { name: "Client 2", logo: "/client-2.jpeg" },
    { name: "Client 3", logo: "/client-3.jpeg" },
    { name: "Client 5", logo: "/client-5.jpeg" },
    { name: "Client 6", logo: "/client-6.jpeg" },
    { name: "Client 7", logo: "/client-7.jpeg" },
    { name: "UCS", logo: "/UCS.png" },
    { name: "LGU", logo: "/LGU.png" },
    { name: "Arfa Karim", logo: "/arfakarim.svg" },
    { name: "PITB", logo: "/PITB.png" },
];

export default function ClientsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 mb-6 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
                            Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Trusted Clients</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            We collaborate with industry leaders and innovative organizations to deliver premium healthcare services across Pakistan.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {allClients.map((client) => (
                            <Card key={client.name} className="group relative overflow-hidden bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                                <div className="aspect-square flex items-center justify-center p-6">
                                    <img
                                        src={client.logo}
                                        alt={client.name}
                                        className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
