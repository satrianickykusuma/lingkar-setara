"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { useCart } from "@/components/cart/CartProvider";
import { describeLine } from "@/components/cart/cart-describer";
import { lineKey, menuById } from "@/components/cart/cart-store";
import {
  clearOrder,
  createOrderCode,
  formatRupiah,
  getOrderSnapshot,
  getServerOrderSnapshot,
  saveOrder,
  subscribeToOrder,
} from "@/components/cart/order-store";
import { paymentMethods } from "@/data/checkout";
import type { PlacedOrder, PaymentMethodId, ServiceType } from "@/data/checkout";
import { paymentCopy, serviceFeeFor, serviceOptions } from "@/data/checkout";
import { whatsappHref } from "@/data/content";

type FieldErrors = Partial<Record<"name" | "phone" | "payment", string>>;

/**
 * Three-step checkout: review the order and how it is served, leave contact
 * details, then choose a payment method.
 *
 * The choices that become sign language are the ones made in the menu (portions,
 * rica, kecap, temperature) plus the two serving options. Payment is collected for
 * the WhatsApp handoff only — the vocabulary has no payment sign, and the page says
 * so rather than pretending otherwise.
 */
export function CheckoutFlow() {
  const { lines, itemCount, subtotal, clear, openDrawer } = useCart();
  const placed = useSyncExternalStore(
    subscribeToOrder,
    getOrderSnapshot,
    getServerOrderSnapshot,
  );

  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceType>("makan-sini");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethodId | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const serviceFee = serviceFeeFor(service);
  const total = subtotal + serviceFee;
  const chosenService = serviceOptions.find((option) => option.id === service);
  const chosenPayment = paymentMethods.find((method) => method.id === payment);

  const nameId = useId();
  const phoneId = useId();
  const notesId = useId();
  const statusId = useId();

  // Success screen. Shown while a stored order exists; the guest can dismiss it to
  // start another order, which is why it is not a dead end.
  if (placed) {
    return <OrderSuccess order={placed} />;
  }

  if (itemCount === 0) {
    return (
      <section className="container-page section-y relative overflow-x-clip pt-28">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-line bg-card p-10 text-center shadow-card">
          <span className="inline-flex size-14 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
            <Icon name="cart" className="size-7" />
          </span>
          <h1 className="font-display text-2xl font-extrabold">{paymentCopy.emptyTitle}</h1>
          <p className="text-sm text-ink-muted">{paymentCopy.emptyBody}</p>
          <Button href={paymentCopy.emptyCta.href} arrow>
            {paymentCopy.emptyCta.label}
          </Button>
        </div>
      </section>
    );
  }

  const validateStep = (index: number): FieldErrors => {
    const found: FieldErrors = {};

    if (index === 1) {
      if (name.trim().length < 2) {
        found.name = "Nama minimal 2 karakter supaya kasir bisa memanggil.";
      }
      const digits = phone.replace(/[^0-9]/g, "");
      if (phone.trim() !== "" && (digits.length < 9 || digits.length > 15)) {
        found.phone = "Nomor WhatsApp tidak lazim. Contoh: 0899-1301-389.";
      }
    }

    if (index === 2 && payment === "") {
      found.payment = "Pilih salah satu metode pembayaran.";
    }

    return found;
  };

  const goNext = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((current) => Math.min(2, current + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
  };

  const sendOrder = async () => {
    const found = validateStep(2);
    setErrors(found);
    if (Object.keys(found).length > 0 || payment === "") return;

    const order: PlacedOrder = {
      code: createOrderCode(),
      createdAt: new Date().toISOString(),
      lines,
      subtotal,
      serviceFee,
      total,
      itemCount,
      service,
      customer: { name: name.trim(), phone: phone.trim() },
      notes: notes.trim(),
      payment,
    };

    // Record the order before handing it off: the backend is what compiles the
    // sign-language plan. A failure here must not cost the guest their order, so it
    // degrades to the WhatsApp handoff and says so on the success screen.
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: order.code,
          service: order.service,
          payment: order.payment,
          customer: order.customer,
          notes: order.notes,
          items: order.lines.map((line) => ({
            id: line.id,
            porsi: line.porsi,
            chili: line.chili,
            soy: line.soy,
            temperature: line.temperature,
          })),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { order?: { id?: string; code?: string } };
        if (data.order?.id) {
          order.orderId = data.order.id;
          order.signPlanPath = `/pesanan/${encodeURIComponent(data.order.code ?? order.code)}`;
        }
      }
    } catch {
      // Offline or the API is down: keep the order, drop the sign-plan link.
    } finally {
      setSubmitting(false);
    }

    saveOrder(order);
    clear();
    window.open(buildWhatsappHref(order), "_blank", "noopener,noreferrer");
  };

  const errorList = Object.values(errors).filter(Boolean) as string[];

  return (
    <section className="container-page section-y relative overflow-x-clip pt-28">
      <LineArt
        motif="orbit"
        tone="sage"
        opacity="opacity-25"
        className="top-24 -left-24 hidden size-64 lg:block"
      />

      <header className="flex flex-col items-start gap-2">
        <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
          <Icon name="shieldCheck" className="size-4" />
          {paymentCopy.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          {paymentCopy.title}
        </h1>
        <p className="max-w-prose text-sm text-ink-muted sm:text-base">{paymentCopy.body}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Stepper current={step} />

          <div className="mt-6 rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
            {step === 0 ? (
              <StepReview service={service} onService={setService} onOpenCart={openDrawer} />
            ) : null}

            {step === 1 ? (
              <StepDetails
                name={name}
                onName={setName}
                phone={phone}
                onPhone={setPhone}
                notes={notes}
                onNotes={setNotes}
                nameId={nameId}
                phoneId={phoneId}
                notesId={notesId}
                errors={{ name: errors.name, phone: errors.phone }}
              />
            ) : null}

            {step === 2 ? (
              <StepPayment payment={payment} onPayment={setPayment} error={errors.payment} />
            ) : null}

            <p id={statusId} aria-live="polite" className="mt-4 min-h-5 text-xs font-bold text-ink">
              {errorList.length > 0 ? errorList.join(" ") : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-5 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
                >
                  Kembali
                </button>
              ) : null}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="bg-electric inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-white"
                >
                  Lanjut
                  <Icon name="arrowRight" className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendOrder}
                  disabled={submitting}
                  className="bg-electric inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-white disabled:opacity-60"
                >
                  <Icon name="whatsapp" className="size-5" />
                  {submitting ? "Menyimpan pesanan…" : "Kirim pesanan"}
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-muted">{paymentCopy.draftNotice}</p>
        </div>

        <aside className="lg:col-span-5">
          <OrderSummary
            subtotal={subtotal}
            serviceFee={serviceFee}
            total={total}
            itemCount={itemCount}
            serviceName={chosenService?.name ?? ""}
            paymentName={chosenPayment?.name}
            onOpenCart={openDrawer}
          />
        </aside>
      </div>
    </section>
  );
}

/* ── Stepper ─────────────────────────────────────────────────────────────── */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {paymentCopy.steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-flex size-7 items-center justify-center rounded-pill text-xs font-black ${
                done ? "bg-sage text-white" : active ? "bg-ocean text-on-brand" : "bg-line/60 text-ink-muted"
              }`}
            >
              {done ? <Icon name="check" className="size-4" /> : index + 1}
            </span>
            <span
              className={`text-sm font-bold ${
                active ? "text-ink" : done ? "text-leaft" : "text-ink-muted"
              }`}
            >
              {label}
            </span>
            {index < paymentCopy.steps.length - 1 ? (
              <span aria-hidden="true" className="text-sm text-line-strong">
                /
              </span>
            ) : null}
          </li>
        );
      })}
      <li className="sr-only" aria-current="step">
        {`Langkah ${current + 1} dari ${paymentCopy.steps.length}: ${paymentCopy.steps[current]}`}
      </li>
    </ol>
  );
}

/* ── Step 1: review + serving ────────────────────────────────────────────── */

function StepReview({
  service,
  onService,
  onOpenCart,
}: {
  service: ServiceType;
  onService: (value: ServiceType) => void;
  onOpenCart: () => void;
}) {
  const { lines } = useCart();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold">Rincian pesanan</h2>
          <button
            type="button"
            onClick={onOpenCart}
            className="text-xs font-bold text-ocean underline-offset-4 hover:underline"
          >
            Ubah
          </button>
        </div>
        <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
          {lines.map((line) => {
            const item = menuById[line.id];
            if (!item) return null;
            return (
              <li key={lineKey(line)} className="flex items-center gap-3 p-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-media">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{describeLine(line)}</p>
                  <p className="text-xs text-ink-muted">
                    {`${line.porsi} × ${formatRupiah(item.price)}`}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-ocean">
                  {formatRupiah(item.price * line.porsi)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <fieldset>
        <legend className="font-display text-base font-bold">Cara penyajian</legend>
        <p className="mt-1 text-xs text-ink-muted">
          Hanya dua pilihan ini yang punya rekaman isyarat.
        </p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {serviceOptions.map((option) => {
            const active = option.id === service;
            return (
              <li key={option.id}>
                <label
                  className={`flex h-full cursor-pointer flex-col gap-2 rounded-card border p-4 transition-colors ${
                    active
                      ? "border-ocean bg-ocean-soft/60"
                      : "border-line-strong/50 bg-base hover:border-ocean/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="service"
                      value={option.id}
                      checked={active}
                      onChange={() => onService(option.id)}
                      className="size-4 accent-ocean"
                    />
                    <Icon name={option.icon} className="size-5 text-ocean" />
                    <span className="text-sm font-bold">{option.name}</span>
                  </span>
                  <span className="text-xs text-ink-muted">{option.blurb}</span>
                  <span className="mt-auto text-xs font-bold text-leaft">{option.feeLabel}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

/* ── Step 2: contact details ─────────────────────────────────────────────── */

function StepDetails({
  name,
  onName,
  phone,
  onPhone,
  notes,
  onNotes,
  nameId,
  phoneId,
  notesId,
  errors,
}: {
  name: string;
  onName: (value: string) => void;
  phone: string;
  onPhone: (value: string) => void;
  notes: string;
  onNotes: (value: string) => void;
  nameId: string;
  phoneId: string;
  notesId: string;
  errors: { name?: string; phone?: string };
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor={nameId} className="text-sm font-bold">
          Nama pemesan <span className="text-tomato-deep">*</span>
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => onName(event.target.value)}
          placeholder="Nama yang dipanggil kasir"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          className="w-full rounded-btn border border-line-strong/70 bg-surface-base px-4 py-3 text-sm transition-all focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
        />
        {errors.name ? (
          <p id={`${nameId}-error`} className="text-xs font-bold text-tomato-deep" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={phoneId} className="text-sm font-bold">
          Nomor WhatsApp <span className="font-normal text-ink-muted">(opsional)</span>
        </label>
        <input
          id={phoneId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => onPhone(event.target.value)}
          placeholder="0899-1301-389"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={`${phoneId}-hint${errors.phone ? ` ${phoneId}-error` : ""}`}
          className="w-full rounded-btn border border-line-strong/70 bg-surface-base px-4 py-3 text-sm transition-all focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
        />
        <p id={`${phoneId}-hint`} className="text-xs text-ink-muted">
          Kami pakai nomor ini hanya untuk mengabari status pesanan.
        </p>
        {errors.phone ? (
          <p id={`${phoneId}-error`} className="text-xs font-bold text-tomato-deep" role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={notesId} className="text-sm font-bold">
          Catatan untuk dapur <span className="font-normal text-ink-muted">(opsional)</span>
        </label>
        <textarea
          id={notesId}
          rows={3}
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          placeholder="Contoh: bungkus terpisah, tambah nasi"
          className="w-full rounded-btn border border-line-strong/70 bg-surface-base px-4 py-3 text-sm transition-all focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
        />
        <p className="text-xs text-ink-muted">
          Catatan bebas tidak diterjemahkan ke isyarat. Gunakan pilihan rica, kecap, dan suhu
          saat memilih menu agar sampai ke kasir dalam bentuk isyarat.
        </p>
      </div>
    </div>
  );
}

/* ── Step 3: payment ─────────────────────────────────────────────────────── */

function StepPayment({
  payment,
  onPayment,
  error,
}: {
  payment: PaymentMethodId | "";
  onPayment: (value: PaymentMethodId) => void;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-display text-base font-bold">Metode pembayaran</legend>
      <ul className="grid gap-3 sm:grid-cols-2">
        {paymentMethods.map((method) => {
          const active = method.id === payment;
          return (
            <li key={method.id}>
              <label
                className={`flex h-full cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors ${
                  active
                    ? "border-ocean bg-ocean-soft/60"
                    : "border-line-strong/50 bg-base hover:border-ocean/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={active}
                  onChange={() => onPayment(method.id)}
                  className="mt-0.5 size-4 accent-ocean"
                />
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <Icon name={method.icon} className="size-5 text-ocean" />
                    <span className="text-sm font-bold">{method.name}</span>
                  </span>
                  <span className="text-xs text-ink-muted">{method.blurb}</span>
                  {active ? (
                    <span className="mt-1 text-xs text-ink">{method.destination}</span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="text-xs font-bold text-tomato-deep" role="alert">
          {error}
        </p>
      ) : null}

      <p className="rounded-card border border-line bg-surface p-4 text-xs text-ink-muted">
        Situs ini tidak memproses pembayaran. Metode yang dipilih dicatat di pesan WhatsApp
        untuk kasir — bukan bagian dari urutan isyarat.
      </p>
    </fieldset>
  );
}

/* ── Order summary ───────────────────────────────────────────────────────── */

function OrderSummary({
  subtotal,
  serviceFee,
  total,
  itemCount,
  serviceName,
  paymentName,
  onOpenCart,
}: {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  serviceName: string;
  paymentName?: string;
  onOpenCart: () => void;
}) {
  const { lines } = useCart();

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-ink">Ringkasan pesanan</h2>
        <span className="rounded-pill bg-ocean-soft px-2.5 py-1 text-xs font-bold text-ocean">
          {`${itemCount} porsi`}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-3 border-b border-line pb-4">
        {lines.map((line) => {
          const item = menuById[line.id];
          if (!item) return null;
          return (
            <li key={lineKey(line)} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-media">
                <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{item.name}</p>
                <p className="text-xs text-ink-muted">{describeLine(line)}</p>
              </div>
              <span className="text-sm font-bold text-ocean">
                {formatRupiah(item.price * line.porsi)}
              </span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="font-bold">{formatRupiah(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-muted">Biaya layanan</dt>
          <dd className="font-bold">{serviceFee === 0 ? "Gratis" : formatRupiah(serviceFee)}</dd>
        </div>
        {serviceName ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-muted">Penyajian</dt>
            <dd className="font-bold">{serviceName}</dd>
          </div>
        ) : null}
        {paymentName ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-muted">Pembayaran</dt>
            <dd className="font-bold">{paymentName}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-display text-base font-bold text-ink">Total</span>
        <span className="text-electric font-display text-2xl font-extrabold">
          {formatRupiah(total)}
        </span>
      </div>

      <p className="mt-3 text-xs text-ink-muted">{paymentCopy.feeNotice}</p>

      <button
        type="button"
        onClick={onOpenCart}
        className="mt-4 w-full rounded-pill border border-line-strong/70 px-5 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
      >
        Lihat keranjang
      </button>
    </div>
  );
}

/* ── Success ─────────────────────────────────────────────────────────────── */

function OrderSuccess({ order }: { order: PlacedOrder }) {
  const method = paymentMethods.find((entry) => entry.id === order.payment);
  const service = serviceOptions.find((entry) => entry.id === order.service);

  return (
    <section className="container-page section-y pt-28">
      <div className="mx-auto max-w-2xl rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
        <span className="inline-flex size-14 items-center justify-center rounded-pill bg-sage/20 text-leaft">
          <Icon name="check" className="size-7" />
        </span>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight">
          {paymentCopy.successTitle}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{paymentCopy.successBody}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
              {paymentCopy.orderCodeLabel}
            </dt>
            <dd className="mt-1 font-display text-xl font-extrabold text-navy">{order.code}</dd>
          </div>
          <div className="rounded-card border border-line bg-surface p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Total</dt>
            <dd className="mt-1 font-display text-xl font-extrabold text-ocean">
              {formatRupiah(order.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 text-sm">
          <p>
            <span className="text-ink-muted">Nama: </span>
            <span className="font-bold">{order.customer.name}</span>
          </p>
          <p>
            <span className="text-ink-muted">Penyajian: </span>
            <span className="font-bold">{service?.name}</span>
          </p>
          <p>
            <span className="text-ink-muted">Pesanan: </span>
            <span className="font-bold">
              {order.lines.map((line) => describeLine(line)).join("; ")}
            </span>
          </p>
        </div>

        {method ? (
          <div className="mt-6 rounded-card border border-ocean/30 bg-ocean-soft/40 p-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Icon name={method.icon} className="size-5 text-ocean" />
              {`Bayar dengan ${method.name}`}
            </p>
            <p className="mt-2 text-sm text-ink">{method.instructions}</p>
            <p className="mt-1 text-xs font-bold text-ink-muted">{method.destination}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {order.signPlanPath ? (
            <Link
              href={order.signPlanPath}
              className="inline-flex items-center gap-2 rounded-pill border-2 border-ocean px-6 py-3 text-sm font-bold text-ocean transition-colors hover:bg-ocean-soft"
            >
              <Icon name="signLanguage" className="size-5" />
              {paymentCopy.openSignPlayer}
            </Link>
          ) : null}
          <a
            href={buildWhatsappHref(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-electric inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-white"
          >
            <Icon name="whatsapp" className="size-5" />
            {paymentCopy.sendAgain}
          </a>
          <Link
            href="/menu"
            onClick={clearOrder}
            className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-6 py-3 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
          >
            {paymentCopy.dismissOrder}
          </Link>
        </div>

        {order.signPlanPath ? null : (
          <p className="mt-4 rounded-card border border-line bg-surface p-4 text-xs font-bold text-tomato-deep">
            {paymentCopy.notRecordedNotice}
          </p>
        )}
      </div>
    </section>
  );
}

/* ── WhatsApp handoff ────────────────────────────────────────────────────── */

function buildWhatsappHref(order: PlacedOrder): string {
  const method = paymentMethods.find((entry) => entry.id === order.payment);
  const service = serviceOptions.find((entry) => entry.id === order.service);

  const rows = order.lines
    .map((line) => {
      const item = menuById[line.id];
      if (!item) return null;
      return `- ${describeLine(line)} = ${formatRupiah(item.price * line.porsi)}`;
    })
    .filter((row): row is string => row !== null);

  const message: string[] = [
    `Halo Kedai Tuli Bersama, saya mau pesan (${order.code}).`,
    "",
    ...rows,
    "",
    `Subtotal: ${formatRupiah(order.subtotal)}`,
    `Total: ${formatRupiah(order.total)}`,
    "",
    `Nama: ${order.customer.name}`,
    `Penyajian: ${service?.name ?? order.service}`,
  ];

  if (order.customer.phone) message.push(`WhatsApp: ${order.customer.phone}`);
  if (order.notes) message.push(`Catatan: ${order.notes}`);
  message.push(`Pembayaran: ${method?.name ?? order.payment}`);

  return whatsappHref(message.join("\n"));
}
