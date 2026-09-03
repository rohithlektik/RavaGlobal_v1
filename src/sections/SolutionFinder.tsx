import { useEffect, useRef, useState } from 'react';
import { useScene } from '@/store/scene';
import { useSectionScrub } from '@/hooks/useSectionScrub';
import { finderSteps, finderResult } from '@/data/solutionFinder';
import { solutionState } from '@/scene/solutionState';
import { MagneticButton } from '@/components/MagneticButton';
import { FinderIcon } from '@/components/FinderIcon';

export function SolutionFinder() {
  const ref = useRef<HTMLElement>(null);
  useSectionScrub(ref, 'solutions');
  const setSolution = useScene((s) => s.setSolution);

  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const done = step >= finderSteps.length;

  // container is only a faint outline while answering; revealed on "Recommended"
  useEffect(() => {
    solutionState.reveal = done ? 1 : 0;
  }, [done]);
  useEffect(() => () => void (solutionState.reveal = 0), []);

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
    <section ref={ref} id="solutions" className="section finder" aria-labelledby="solutions-title">
      {/* legibility scrim — the container behind is only an outline while
          answering, but keep the copy crisp regardless of what is on screen */}
      <div className="finder__scrim" aria-hidden="true" />

      <div className="finder__inner">
        <div className="mb-10 flex items-center gap-4">
          <span className="section__index">03</span>
          <span className="tech-label">Find your RAVA solution</span>
        </div>

        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <h2
              id="solutions-title"
              className="leading-[1.12] tracking-[-0.01em] text-[var(--rava-pale)]"
              style={{ fontSize: 'clamp(1.7rem, 1rem + 2.4vw, 2.9rem)', fontWeight: 400 }}
            >
              {done ? finderResult.title : current.question}
            </h2>
            <p className="mt-6 max-w-md text-[var(--rava-mist)]" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
              {done
                ? finderResult.body
                : 'Start with the operation, not the equipment. Three questions — the world around the container changes with each answer.'}
            </p>

            {done && (
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton href="/quote">{finderResult.cta}</MagneticButton>
                <button
                  type="button"
                  className="tech-label text-[var(--rava-mist)] underline underline-offset-4"
                  onClick={reset}
                >
                  Start over
                </button>
              </div>
            )}

            <ol className="finder__progress" aria-label={`Step ${Math.min(step + 1, finderSteps.length)} of ${finderSteps.length}`}>
              {finderSteps.map((s, i) => (
                <li key={s.id} data-state={i < step ? 'done' : i === step ? 'active' : 'idle'} />
              ))}
            </ol>
          </div>

          <div>
            {!done && (
              <ul className="finder__options">
                {current.options.map((o) => {
                  const selected = picks[step] === o.label;
                  return (
                    <li key={o.label}>
                      <button
                        type="button"
                        onClick={() => choose(o.label, o.env)}
                        className="finder-option"
                        data-selected={selected || undefined}
                        aria-pressed={selected}
                      >
                        <span className="finder-option__icon">
                          <FinderIcon name={o.icon} />
                        </span>
                        <span className="finder-option__text">
                          <span className="finder-option__label">{o.label}</span>
                          <span className="finder-option__note">{o.note}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {done && (
              <div className="finder__result">
                <p className="tech-label text-[var(--rava-light)]">Recommended</p>
                <p className="mt-3 text-[var(--step-sub)] font-black text-[var(--rava-pale)]">
                  Temperature-controlled RAVA unit
                </p>
                <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {picks.map((p, i) => (
                    <div key={i}>
                      <dt className="text-[var(--step-label)] text-[var(--rava-mist)]">
                        {finderSteps[i].question}
                      </dt>
                      <dd className="mt-1 text-[var(--rava-pale)]" style={{ fontSize: '1rem' }}>
                        {p}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
