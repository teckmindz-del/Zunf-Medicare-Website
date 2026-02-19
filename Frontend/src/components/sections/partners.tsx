// Partner logos - only include images that exist in public folder
const partners = [
  { name: "Chughtai Lab", logo: "/chughtai.jpeg" },
  { name: "Dr. Essa Laboratories & Diagnostic Center", logo: "/drEssa.jpeg" },
  { name: "Test Zone Diagnostic Center", logo: "/testzone.jpeg" },
  { name: "BioTech Lahore Lab", logo: "/biotech.jpeg" },
  { name: "Ayzal Lab", logo: "/ayzal.jpeg" },
  { name: "Lahore PCR Lab", logo: "/testzone.jpeg" },
  { name: "Jinnah MRI & Diagnostic Center", logo: "/jinnahMRI.jpeg" },
  { name: "Esthetique Canon", logo: "/esthetic.jpeg" },
];

// Duplicate for seamless infinite scroll
const duplicatedPartners = [...partners, ...partners, ...partners];

export function Partners() {
  return (
    <section className="relative w-full bg-gradient-to-br from-background via-background to-accent/10 py-12 overflow-hidden -mt-16">
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60 z-10 pointer-events-none" />

      <div className="relative z-20">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-foreground/90">
            Our Trusted <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Clients</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto px-4">
            We collaborate with industry leaders and innovative organizations to deliver premium healthcare services across Pakistan.
          </p>
        </div>

        <div className="flex animate-scroll-left-fast">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-6 flex items-center justify-center"
              style={{ width: "200px" }}
            >
              <div className="relative w-full h-24 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:bg-slate-50 dark:hover:bg-slate-600">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  width={160}
                  height={80}
                  className="object-contain max-h-20 w-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


