import { useRef, useState } from 'react';
import { useScene } from '@/store/scene';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import { finderSteps, finderResult } from '@/data/solutionFinder';
import { MagneticButton } from '@/components/MagneticButton';

export function SolutionFinder() {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, 'solutions');
  const setSolution = useScene((s) => s.setSolution);

  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const done = step >= finderSteps.length;

  const choose = (label: string, env: string) => {
    const next = [...picks.slice(0, step), label];
    setPicks(next);
    setSolution(step + 1, env);
    setStep(step + 1);
  };
  const reset = () => {
    setPicks([]);
    setStep(0);
    setSolution(0, null);
  };

  const current = finderSteps[Math.min(step, finderSteps.length - 1)];

  return (
    <section ref={ref} id="solutions" className="section" aria-labelledby="solutions-title">
      <div className="mb-10 flex items-center gap-4">
        <span className="section__index">03</span>
        <span className="tech-label">Find your RAVA solution</span>
      </div>

      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <h2 id="solutions-title" className="text-[var(--step-title)]">
            {done ? finderResult.title : current.question}
          </h2>
          <p className="mt-6 max-w-md text-[var(--text-dim)]">
            {done
              ? finderResult.body
              : 'Start with the operation, not the equipment. Three questions — the world around the container changes with each answer.'}
          </p>

          {done && (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton href="#quote">{finderResult.cta}</MagneticButton>
              <button type="button" className="tech-label underline underline-offset-4" onClick={reset}>
                Start over
              </button>
            </div>
          )}

          <ol className="mt-12 flex gap-3" aria-label="Progress">
            {finderSteps.map((s, i) => (
              <li
                key={s.id}
                className="h-1 flex-1 bg-[var(--line)]"
                style={{ background: i < step ? 'var(--rava-light)' : undefined }}
              />
            ))}
          </ol>
        </div>

        <div>
          {!done && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {current.options.map((o) => {
                const selected = picks[step] === o.label;
                return (
                  <li key={o.label}>
                    <button
                      type="button"
                      onClick={() => choose(o.label, o.env)}
                      className="group flex w-full flex-col gap-2 border border-[var(--line)] p-5 text-left transition-colors duration-300 hover:border-[var(--line-strong)] hover:bg-[rgba(140,201,235,0.06)]"
                      style={selected ? { borderColor: 'var(--rava-light)' } : undefined}
                      aria-pressed={selected}
                    >
                      <span className="text-[var(--step-sub)] font-black leading-none">{o.label}</span>
                      <span className="text-[var(--step-label)] leading-snug text-[var(--text-dim)]">
                        {o.note}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {done && (
            <div className="border border-[var(--line-strong)] p-8">
              <p className="tech-label">Recommended</p>
              <p className="mt-3 text-[var(--step-sub)] font-black">
                Temperature-controlled RAVA unit
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-[var(--step-label)]">
                {picks.map((p, i) => (
                  <div key={i}>
                    <dt className="text-[var(--text-faint)]">{finderSteps[i].question}</dt>
                    <dd className="mt-1 text-[var(--text)]">{p}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
