import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { orderSteps } from "@/data/belajar";

/** The five-step ordering flow, rendered as an ordered list. */
export function OrderSteps() {
  return (
    <section
      aria-labelledby="alur-title"
      className="container-page section-y relative overflow-hidden"
    >
      <div className="rounded-sheet bg-surface px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <LineArt
          motif="ripples"
          tone="sage"
          opacity="opacity-35"
          className="-top-10 -right-10 hidden size-64 lg:block"
        />

        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
              <Icon name="route" className="size-4" />
              Alur Cepat Memesan di Kasir
            </p>
            <h2
              id="alur-title"
              className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              5 Tahap, <span className="text-electric">Sekali Perjumpaan</span>
            </h2>
          </div>
          <p className="text-sm font-bold text-ink-muted">
            ± 1 menit untuk pesanan pertama Anda
          </p>
        </div>

        <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {orderSteps.map((step) => (
            <li
              key={step.id}
              className="hover-lift flex h-full flex-col gap-3 rounded-card border border-line-strong/40 bg-card p-5 shadow-card"
            >
              <span
                aria-hidden="true"
                className="text-electric font-display text-3xl font-extrabold"
              >
                {step.index}
              </span>
              <p className="font-display text-base font-bold leading-snug">
                {step.title}
              </p>
              <p className="text-sm text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
