const STEPS = ['Cart', 'Details', 'Payment', 'Done'];

/** Checkout progress. `step` is 1-4: earlier steps show a tick, the current one is highlighted. */
export default function Stepper({ step }) {
  return (
    <div className="stepper" aria-label="Checkout progress">
      {STEPS.map((s, i) => <div key={s} data-n={i + 1} className={i + 1 < step ? 'done' : i + 1 === step ? 'now' : undefined}>{s}</div>)}
    </div>
  );
}
