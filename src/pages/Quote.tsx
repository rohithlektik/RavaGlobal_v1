import { useMemo, useState } from 'react';
import { InnerLayout } from './InnerLayout';

type Data = Record<string, string>;

const STEPS = [
  {
    key: 'need',
    title: 'What do you need?',
    kind: 'choice' as const,
    field: 'need',
    options: ['Buy', 'Rent', 'Service', 'Parts'],
  },
  {
    key: 'equipment',
    title: 'What equipment?',
    kind: 'choice' as const,
    field: 'equipment',
    options: ['Refrigerated Container', 'Dry Container', 'Chassis', 'Genset', 'Parts', 'Other'],
  },
  {
    key: 'requirements',
    title: 'Your requirements',
    kind: 'fields' as const,
    fields: [
      { name: 'size', label: 'Size', placeholder: "e.g. 20′ / 40′" },
      { name: 'quantity', label: 'Quantity', placeholder: '1' },
      { name: 'timeline', label: 'Timeline', placeholder: 'When do you need it?' },
      { name: 'location', label: 'Location', placeholder: 'City, State' },
    ],
  },
  {
    key: 'details',
    title: 'Your details',
    kind: 'fields' as const,
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Full name' },
      { name: 'company', label: 'Company', placeholder: 'Company' },
      { name: 'email', label: 'Email', placeholder: 'you@company.com' },
      { name: 'phone', label: 'Phone', placeholder: '(000) 000-0000' },
    ],
  },
  {
    key: 'message',
    title: 'Message',
    kind: 'textarea' as const,
    field: 'message',
  },
];

export function Quote() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({});
  const [done, setDone] = useState(false);

  const current = STEPS[step];
  const pct = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : setDone(true));
  const back = () => setStep(Math.max(0, step - 1));

  const canAdvance =
    current.kind === 'choice' ? !!data[current.field] : current.kind === 'textarea' ? true : true;

  return (
    <InnerLayout>
      <section className="quote">
        <div className="quote__aside">
          <p className="quote__eyebrow">Request a Quote</p>
          <h1 className="quote__title">
            <span>Tell RAVA</span>
            <span>what you need.</span>
          </h1>
          <p className="quote__note">
            Containers, rentals, parts or service — a few quick questions and RAVA comes back with a
            quote.
          </p>
          <ol className="quote__steps">
            {STEPS.map((s, i) => (
              <li key={s.key} data-state={i === step ? 'current' : i < step ? 'done' : undefined}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </li>
            ))}
          </ol>
        </div>

        <div className="quote__main">
          {done ? (
            <div className="quote__done">
              <p className="quote__eyebrow">Received</p>
              <h2>Thanks — RAVA will be in touch.</h2>
              <p>A specialist will follow up on your request shortly.</p>
            </div>
          ) : (
            <form
              className="quote__form"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <div className="quote__bar">
                <span style={{ width: `${pct}%` }} />
              </div>
              <p className="quote__step-index">
                Step {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </p>
              <h2 className="quote__step-title">{current.title}</h2>

              {current.kind === 'choice' && (
                <div className="quote__choices">
                  {current.options.map((o) => (
                    <button
                      type="button"
                      key={o}
                      className="quote__choice"
                      data-selected={data[current.field] === o || undefined}
                      onClick={() => set(current.field, o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {current.kind === 'fields' && (
                <div className="quote__fields">
                  {current.fields.map((f) => (
                    <label key={f.name} className="quote__field">
                      <span>{f.label}</span>
                      <input
                        type="text"
                        value={data[f.name] ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => set(f.name, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              )}

              {current.kind === 'textarea' && (
                <label className="quote__field">
                  <span>Additional requirements</span>
                  <textarea
                    rows={5}
                    value={data.message ?? ''}
                    placeholder="Anything else RAVA should know"
                    onChange={(e) => set('message', e.target.value)}
                  />
                </label>
              )}

              <div className="quote__actions">
                {step > 0 && (
                  <button type="button" className="btn btn--ghost" onClick={back}>
                    <span>Back</span>
                  </button>
                )}
                <button type="submit" className="btn" disabled={!canAdvance} data-cursor="cta">
                  <span>{step === STEPS.length - 1 ? 'Get My Quote' : 'Continue'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </InnerLayout>
  );
}
