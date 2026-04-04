export default function ZonePage({ params }: { params: { id: string } }) {
  return (
    <main>
      <p>Zone detail: {params.id} — Phase 3</p>
    </main>
  )
}
