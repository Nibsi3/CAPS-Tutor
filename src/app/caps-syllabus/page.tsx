export default function CapsSyllabusPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-headline mb-2 text-4xl font-bold">CAPS Syllabus</h1>
        <p className="text-muted-foreground max-w-3xl">Our content aligns with the Department of Basic Education’s Curriculum and Assessment Policy Statement (CAPS) for Grades 8–12. Below are key resources and subject groupings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Mathematics" desc="Algebra, functions, geometry, trigonometry, probability, calculus (Gr 12)."/>
        <Card title="Physical Sciences" desc="Physics (mechanics, waves, electricity) and Chemistry (matter, reactions)."/>
        <Card title="Life Sciences" desc="Cells, genetics, evolution, human physiology, ecology and biodiversity."/>
      </div>

      <div className="mt-10 rounded-xl border bg-card p-6">
        <h2 className="font-headline mb-2 text-2xl font-semibold">Official references</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>DBE CAPS policy documents — see the DBE website (use ‘Curriculum Assessment Policy Statements’).</li>
          <li>Siyavula open textbooks for Mathematics & Sciences — high-quality, CAPS-aligned content.</li>
        </ul>
      </div>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-headline mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}



