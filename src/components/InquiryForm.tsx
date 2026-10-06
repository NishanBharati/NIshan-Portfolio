import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Send } from 'lucide-react';
import { GRADIENT_PILL_CLASS, GRADIENT_PILL_STYLE } from './ContactButton';
import { PROFILE, SERVICES } from '../data/content';
import { INQUIRY_LIMITS, submitInquiry } from '../lib/inquiries';
import { isSupabaseConfigured } from '../lib/supabase';

type Fields = { name: string; email: string; phone: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY: Fields = { name: '', email: '', phone: '', service: '', message: '' };
const SERVICE_OPTIONS = [...SERVICES.map((s) => s.name), 'Something else'];
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Real people take a few seconds to fill in a form; instant submissions are almost always bots. */
const MIN_FILL_MS = 3000;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!EMAIL_PATTERN.test(f.email.trim())) e.email = 'Please enter a valid email address.';
  if (f.phone && !/^[+\d][\d\s()-]{5,}$/.test(f.phone.trim())) e.phone = 'Please enter a valid phone number.';
  if (f.message.trim().length < INQUIRY_LIMITS.messageMin) e.message = 'Tell me a little more (at least 10 characters).';
  return e;
}

const inputClass = (invalid: boolean) =>
  `w-full rounded-[22px] border-2 bg-transparent px-5 py-3.5 font-light text-[#D7E2EA] outline-none transition-colors duration-200 placeholder:text-[#D7E2EA]/35 focus:border-[#D7E2EA] focus:bg-[#D7E2EA]/[0.03] ${
    invalid ? 'border-[#ff7a90]' : 'border-[#D7E2EA]/20 hover:border-[#D7E2EA]/40'
  }`;

export default function InquiryForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const honeypot = useRef<HTMLInputElement>(null);
  const startedAt = useRef(Date.now());

  const set = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`inquiry-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    // Bot traps: pretend it worked so bots don't learn to adapt.
    if (honeypot.current?.value || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus('success');
      return;
    }

    if (!isSupabaseConfigured) {
      // No backend yet: hand the inquiry to the visitor's email app instead.
      const body = `${fields.message}\n\n— ${fields.name}\n${fields.email}${fields.phone ? `\n${fields.phone}` : ''}`;
      const subject = `Project inquiry${fields.service ? `: ${fields.service}` : ''}`;
      window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus('submitting');
    try {
      await submitInquiry(fields);
      setStatus('success');
      setFields(EMPTY);
    } catch (error) {
      console.error('Inquiry failed', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 text-center" role="status">
        <span className="flex h-20 w-20 items-center justify-center rounded-full" style={GRADIENT_PILL_STYLE}>
          <CheckCircle2 aria-hidden className="h-9 w-9 text-white" strokeWidth={1.5} />
        </span>
        <h3 className="font-medium uppercase text-[#D7E2EA]" style={{ fontSize: 'clamp(1.25rem, 2.2vw, 2rem)' }}>
          Message received
        </h3>
        <p className="max-w-sm font-light leading-relaxed text-[#D7E2EA]/60">
          Thanks for reaching out! I'll review your inquiry and get back to you by email soon.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus('idle');
          }}
          className="mt-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby="inquiry-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" required error={errors.name}>
          <input
            id="inquiry-name"
            className={inputClass(!!errors.name)}
            placeholder="Full name"
            autoComplete="name"
            maxLength={INQUIRY_LIMITS.name}
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
          />
        </Field>
        <Field id="email" label="Email" required error={errors.email}>
          <input
            id="inquiry-email"
            type="email"
            className={inputClass(!!errors.email)}
            placeholder="you@company.com"
            autoComplete="email"
            maxLength={INQUIRY_LIMITS.email}
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
          />
        </Field>
        <Field id="phone" label="Phone" hint="Optional" error={errors.phone}>
          <input
            id="inquiry-phone"
            type="tel"
            className={inputClass(!!errors.phone)}
            placeholder="+977 98XXXXXXXX"
            autoComplete="tel"
            maxLength={INQUIRY_LIMITS.phone}
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'inquiry-phone-error' : undefined}
          />
        </Field>
        <Field id="service" label="Interested in" hint="Optional">
          <div className="relative">
            <select
              id="inquiry-service"
              className={`${inputClass(false)} appearance-none pr-12 ${fields.service ? '' : 'text-[#D7E2EA]/35'}`}
              value={fields.service}
              onChange={(e) => set('service', e.target.value)}
            >
              <option value="" className="bg-[#0C0C0C] text-[#D7E2EA]">
                Select a service
              </option>
              {SERVICE_OPTIONS.map((name) => (
                <option key={name} value={name} className="bg-[#0C0C0C] text-[#D7E2EA]">
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D7E2EA]/60" />
          </div>
        </Field>
      </div>

      <Field id="message" label="Project details" required error={errors.message}>
        <textarea
          id="inquiry-message"
          rows={6}
          className={`${inputClass(!!errors.message)} resize-y`}
          placeholder="Tell me about your project, goals and timeline…"
          maxLength={INQUIRY_LIMITS.message}
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'inquiry-message-error' : undefined}
        />
      </Field>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="inquiry-website">Website</label>
        <input id="inquiry-website" ref={honeypot} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <p role="alert" className="flex items-start gap-3 rounded-[22px] border border-[#ff7a90]/40 bg-[#ff7a90]/10 px-5 py-4 text-sm font-light text-[#ffd0d8]">
          <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Your message couldn't be sent. Please try again, or email me directly at{' '}
            <a href={`mailto:${PROFILE.email}`} className="underline underline-offset-4">
              {PROFILE.email}
            </a>
            .
          </span>
        </p>
      )}

      <div className="mt-1 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="inquiry-note" className="text-xs font-light text-[#D7E2EA]/50 sm:max-w-[260px]">
          Your details are only used to reply to your inquiry.
        </p>
        <button type="submit" className={GRADIENT_PILL_CLASS} style={GRADIENT_PILL_STYLE} disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send inquiry
              <Send aria-hidden className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

type FieldProps = { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode };

function Field({ id, label, required, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`inquiry-${id}`} className="flex items-baseline gap-2 text-xs font-medium uppercase tracking-widest text-[#D7E2EA]/60">
        {label}
        {required && (
          <span aria-hidden className="text-[#B600A8]">
            *
          </span>
        )}
        {hint && <span className="font-light normal-case tracking-normal text-[#D7E2EA]/35">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`inquiry-${id}-error`} className="pl-2 text-xs font-light text-[#ff9aac]">
          {error}
        </p>
      )}
    </div>
  );
}
