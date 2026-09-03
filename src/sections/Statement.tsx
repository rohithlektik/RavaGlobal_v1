/**
 * Scroll-distance spacer for the hero -> "Powering smarter storage" beat. The
 * visible copy is a fixed overlay (<StatementStage>) rendered outside the
 * transformed content layer so it can stay pinned beside the square product
 * stage; this element only creates the scroll runway and carries the heading
 * for assistive tech / SEO.
 */
const HEAD = 'Powering smarter storage solutions with RAVA.';
const BODY =
  'From temperature-controlled units to heavy-duty dry containers, RAVA delivers ' +
  'scalable storage solutions backed by 24/7 expert support.';

export function Statement() {
  return (
    <section id="statement" className="relative h-[240vh]" aria-labelledby="statement-heading">
      <h2 id="statement-heading" className="sr-only">
        {HEAD}
      </h2>
      <p className="sr-only">{BODY}</p>
    </section>
  );
}
