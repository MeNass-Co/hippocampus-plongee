"use client";

import { useState, type FormEvent } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";

const SUBJECT_OPTIONS = [
  "Bapt\u00eame de plong\u00e9e",
  "Formation FFESSM",
  "Plong\u00e9e technique",
  "Sorties & voyages",
  "Le Club",
  "Autre",
] as const;

function InputField({
  id,
  label,
  type = "text",
  required = false,
  className = "",
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={label}
        aria-label={label}
        className="peer w-full bg-transparent border-0 border-b border-on-surface/[0.06] py-4 px-0 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none transition-colors duration-500 ease-expo focus:border-primary"
      />
      {/* Animated underline */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-primary transition-all duration-500 ease-expo peer-focus:w-full" />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  required = false,
  className = "",
}: {
  id: string;
  label: string;
  options: readonly string[];
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        name={id}
        required={required}
        defaultValue=""
        aria-label={label}
        className="peer w-full bg-transparent border-0 border-b border-on-surface/[0.06] py-4 px-0 text-on-surface focus:ring-0 focus:outline-none appearance-none cursor-pointer transition-colors duration-500 ease-expo focus:border-primary [&:invalid]:text-on-surface-variant/50"
      >
        <option value="" disabled className="text-on-surface-variant/30 bg-surface-container">
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface-container">
            {opt}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">
        &#9662;
      </span>
      {/* Animated underline */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-primary transition-all duration-500 ease-expo peer-focus:w-full" />
    </div>
  );
}

function TextareaField({
  id,
  label,
  rows = 4,
  required = false,
}: {
  id: string;
  label: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        placeholder={label}
        aria-label={label}
        className="peer w-full bg-transparent border-0 border-b border-on-surface/[0.06] py-4 px-0 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none resize-none transition-colors duration-500 ease-expo focus:border-primary"
      />
      {/* Animated underline */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-primary transition-all duration-500 ease-expo peer-focus:w-full" />
    </div>
  );
}

/* ---------- Info Cards ---------- */

function LocationCard() {
  return (
    <div className="card-frame h-full">
      <div className="card-frame-inner bg-surface-container-low p-8 h-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl" role="img" aria-label="Localisation">
            &#x1F4CD;
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60 font-label">
            Base d&apos;entra&icirc;nement
          </span>
        </div>
        <h3 className="font-headline text-xl italic font-light text-on-surface mb-2 leading-tight">
          Piscine &amp; Fosse de Sissonne
        </h3>
        <address className="not-italic text-sm text-on-surface-variant font-light leading-relaxed">
          Rue de la Gare, 02150 Sissonne, France
        </address>

        {/* Map placeholder */}
        <div className="relative mt-6 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-surface-container to-surface-container-highest flex items-center justify-center">
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-label">
            Sissonne, Aisne (02)
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main ContactForm Component ---------- */

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * PLACEHOLDER: No backend/API route is connected yet.
   * Opens the user's mail client with the form data as a mailto: fallback.
   * TODO: Replace with a proper API route (e.g. /api/contact) or third-party service.
   */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const name = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const mailtoSubject = encodeURIComponent(`[Hippocampus] ${subject}`);
    const mailtoBody = encodeURIComponent(
      `Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\n${message}`
    );

    window.location.href = `mailto:contact@hippocampus-plongee.fr?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <section id="contact" className="px-6 md:px-12 lg:px-24 py-16 md:py-32 relative overflow-hidden" style={{ backgroundColor: 'rgba(10, 21, 32, 0.85)' }}>
      {/* Decorative blurs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column — Form in card-frame */}
        <ScrollReveal animation="fade-up" className="lg:col-span-7">
          <div className="card-frame h-full">
            <div className="card-frame-inner bg-surface-container p-6 md:p-12 h-full">
              <h2 className="font-headline text-2xl md:text-3xl font-light text-on-surface mb-8 md:mb-10 tracking-tight leading-tight">
                Message de Surface
              </h2>

              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center py-16 gap-4"
                  role="status"
                  aria-live="polite"
                >
                  <span className="text-primary text-5xl">&#10003;</span>
                  <p className="font-headline text-xl text-on-surface">
                    Votre client mail a &eacute;t&eacute; ouvert.
                  </p>
                  <p className="text-sm text-on-surface-variant font-light">
                    Envoyez le message depuis votre bo&icirc;te mail.
                    Nous vous r&eacute;pondrons sous 48h.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs uppercase tracking-[0.2em] text-primary hover:underline transition-colors duration-500 ease-expo active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-6">
                    {/* Full name */}
                    <InputField
                      id="fullname"
                      label="Nom complet"
                      required
                    />

                    {/* Email + Subject row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        id="email"
                        label="Adresse e-mail"
                        type="email"
                        required
                      />
                      <SelectField
                        id="subject"
                        label="Votre sujet"
                        options={SUBJECT_OPTIONS}
                        required
                      />
                    </div>

                    {/* Message */}
                    <TextareaField
                      id="message"
                      label="Votre message..."
                      rows={4}
                      required
                    />

                    {/* Submit — magnetic button */}
                    <Button
                      type="submit"
                      variant="glass"
                      magnetic={true}
                      size="lg"
                      className="w-full text-center"
                      disabled={submitting}
                    >
                      {submitting ? "Transmission en cours\u2026" : "Transmettre le signal"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Right column — Location card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ScrollReveal animation="fade-up" delay={100}>
            <LocationCard />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
