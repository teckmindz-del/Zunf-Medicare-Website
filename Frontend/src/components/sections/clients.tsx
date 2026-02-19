import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Client logos
const clients = [
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
  { name: "Dr Essa", logo: "/drEssa.jpeg" },
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

// Duplicate for perfectly seamless infinite scroll
const duplicatedClients = [...clients, ...clients];

export function Clients() {
  return (
    <section className="relative w-full bg-gradient-to-br from-background via-background to-accent/10 py-12 overflow-hidden border-y border-primary/10">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />

      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/90">
            Our Trusted <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Clients</span>
          </h2>
        </div>

        <div className="relative overflow-hidden group">
          <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
            {duplicatedClients.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="flex-shrink-0 mx-4 sm:mx-8 flex items-center justify-center"
                style={{ width: "200px" }}
              >
                <div className="relative w-full h-32 flex items-center justify-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:bg-white/20 dark:hover:bg-white/10 group/item">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="object-contain max-h-24 w-auto transition-all duration-500 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/clients">
            <Button variant="outline" size="sm" className="group rounded-full border-primary/20 hover:border-primary/50 text-xs sm:text-sm">
              View All Clients
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}


