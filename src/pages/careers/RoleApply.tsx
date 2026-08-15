import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Mail, Paperclip, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { CAREERS_CONTACT_EMAIL, ROLES, getRole, roleHref, sortRoles } from '@/data/careers';
import {
    ACCEPTED_CV_TYPES,
    MAX_CV_BYTES,
    buildMailtoFallback,
    isCareersEndpointConfigured,
    submitApplication,
    type ApplicationPayload,
} from '@/lib/careersSubmit';
import CareersLegal from '@/components/careers/CareersLegal';
import SEO from '@/components/SEO';

const urlish = z
    .string()
    .trim()
    .url({ message: 'Enter a full URL, including https://' })
    .or(z.literal(''))
    .optional();

const schema = z
    .object({
        fullName: z.string().trim().min(2, 'Please tell us your name'),
        email: z.string().trim().email('Enter a valid email address'),
        phone: z.string().trim().optional(),
        location: z.string().trim().min(2, 'Where are you based? (city / country)'),
        roleKey: z.string().min(1, 'Choose the role you are applying for'),
        portfolioUrl: urlish,
        linkedinUrl: urlish,
        cvUrl: urlish,
        coverNote: z
            .string()
            .trim()
            .min(80, 'A few sentences, please. At least 80 characters')
            .max(4000, 'Please keep this under 4000 characters'),
        earliestStart: z.string().trim().optional(),
        heardFrom: z.string().trim().optional(),
        rightToWork: z.literal(true, {
            errorMap: () => ({ message: 'Please confirm this to continue' }),
        }),
        consent: z.literal(true, {
            errorMap: () => ({ message: 'We need your consent to process the application' }),
        }),
        /** Hidden anti-spam field. Real people never fill this in. */
        website: z.string().max(0).optional(),
    })
    // We need to be able to see the person's work somehow.
    .refine(
        (values) => Boolean(values.portfolioUrl || values.linkedinUrl || values.cvUrl),
        {
            message: 'Add at least one link: portfolio, LinkedIn, or a CV link. You can also attach a CV below',
            path: ['portfolioUrl'],
        },
    );

type FormValues = z.infer<typeof schema>;

const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-lumicoria-purple focus:ring-1 focus:ring-lumicoria-purple';

function Field({
    label,
    htmlFor,
    hint,
    error,
    required,
    children,
}: {
    label: string;
    htmlFor: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-0.5 text-lumicoria-purple">*</span>}
            </label>
            {hint && <p className="mb-1.5 text-xs text-gray-500">{hint}</p>}
            {children}
            {error && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function RoleApply() {
    const { department = '', slug = '' } = useParams();
    const routeRole = getRole(department, slug);
    const isGeneral = !routeRole;

    const [submitted, setSubmitted] = useState(false);
    const [failedPayload, setFailedPayload] = useState<ApplicationPayload | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | null>(null);
    const mountedAt = useRef(Date.now());

    const roleOptions = useMemo(() => sortRoles(ROLES), []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleKey: routeRole ? `${routeRole.department}/${routeRole.slug}` : '',
            coverNote: '',
        },
    });

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setCvError(null);

        if (!file) {
            setCvFile(null);
            return;
        }
        if (file.size > MAX_CV_BYTES) {
            setCvError('That file is larger than 5MB. Try compressing it, or paste a link instead.');
            setCvFile(null);
            event.target.value = '';
            return;
        }
        if (file.type && !ACCEPTED_CV_TYPES.includes(file.type)) {
            setCvError('Please upload a PDF or Word document.');
            setCvFile(null);
            event.target.value = '';
            return;
        }
        setCvFile(file);
    };

    const onSubmit = async (values: FormValues) => {
        // Bots fill forms instantly; humans do not.
        if (Date.now() - mountedAt.current < 3000) {
            toast.error('That was a little too quick. Please try again.');
            return;
        }
        if (values.website) return; // honeypot tripped

        const [dept, roleSlug] = values.roleKey.split('/');
        const selected = getRole(dept, roleSlug);

        const payload: ApplicationPayload = {
            roleTitle: selected?.title ?? 'Speculative application',
            roleSlug: roleSlug ?? 'speculative',
            department: dept ?? 'general',
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            location: values.location,
            portfolioUrl: values.portfolioUrl,
            linkedinUrl: values.linkedinUrl,
            cvUrl: values.cvUrl,
            coverNote: values.coverNote,
            earliestStart: values.earliestStart,
            heardFrom: values.heardFrom,
            rightToWork: values.rightToWork,
            consent: values.consent,
            cvFile,
        };

        const result = await submitApplication(payload);

        if (result.ok) {
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Never strand the candidate. Offer the email route instead.
        setFailedPayload(payload);
        toast.error(result.message);
    };

    // Success
    if (submitted) {
        return (
            <div className="bg-white">
                <SEO title="Application received" description="Thank you for applying to Lumicoria." noindex />
                <section className="container mx-auto px-4 py-24">
                    <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-10 text-center">
                        <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-green-500" aria-hidden="true" />
                        <h1 className="mb-3 text-2xl font-semibold text-lumicoria-obsidian">Application received</h1>
                        <p className="mb-6 leading-relaxed text-gray-500">
                            Thank you. It reached us. We read every application ourselves, and we&rsquo;ll come
                            back to you either way. If it&rsquo;s a fit, the next step is a short intro call where we
                            walk through the role and the terms together.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                to="/careers"
                                className="rounded-md bg-lumicoria-purple px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-lumicoria-deepPurple"
                            >
                                Back to open roles
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <SEO
                title={routeRole ? `Apply for ${routeRole.title}` : 'Apply'}
                description={
                    routeRole
                        ? `Apply for the ${routeRole.title} role at Lumicoria.`
                        : 'Send Lumicoria a speculative application.'
                }
                noindex
            />

            <section className="border-b border-gray-200 bg-[#F8F6FC]">
                <div className="container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-2xl">
                        <Link
                            to={routeRole ? roleHref(routeRole) : '/careers'}
                            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-lumicoria-purple"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {routeRole ? `Back to ${routeRole.title}` : 'Back to careers'}
                        </Link>
                        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-lumicoria-obsidian md:text-4xl">
                            {routeRole ? `Apply for ${routeRole.title}` : 'Speculative application'}
                        </h1>
                        <p className="leading-relaxed text-gray-500">
                            {routeRole
                                ? 'Show us your work. A portfolio, repo, or campaign tells us far more than a CV, and we read every application ourselves.'
                                : 'Tell us what you do and what you would want to own here. If it is compelling, we will make room.'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-12">
                <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6" noValidate>
                    {/* Honeypot. Visually hidden, never focusable. */}
                    <div className="absolute left-[-9999px]" aria-hidden="true">
                        <label htmlFor="website">Leave this field empty</label>
                        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
                    </div>

                    <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
                        <input id="fullName" className={inputClass} autoComplete="name" {...register('fullName')} />
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                            <input
                                id="email"
                                type="email"
                                className={inputClass}
                                autoComplete="email"
                                {...register('email')}
                            />
                        </Field>
                        <Field label="Phone" htmlFor="phone" hint="Optional" error={errors.phone?.message}>
                            <input id="phone" type="tel" className={inputClass} autoComplete="tel" {...register('phone')} />
                        </Field>
                    </div>

                    <Field
                        label="Where are you based?"
                        htmlFor="location"
                        hint="City and country. We are remote, we just want to know your time zone"
                        error={errors.location?.message}
                        required
                    >
                        <input id="location" className={inputClass} {...register('location')} />
                    </Field>

                    <Field label="Role" htmlFor="roleKey" error={errors.roleKey?.message} required>
                        {isGeneral ? (
                            <select id="roleKey" className={inputClass} {...register('roleKey')}>
                                <option value="">Select a role…</option>
                                {roleOptions.map((role) => (
                                    <option
                                        key={`${role.department}/${role.slug}`}
                                        value={`${role.department}/${role.slug}`}
                                    >
                                        {role.title} · {role.type}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            // Locked to the role from the URL. Rendered as static text with a
                            // hidden input rather than a `disabled` select: react-hook-form
                            // reads disabled fields as `undefined`, which would fail validation
                            // and block every role-specific application.
                            <>
                                <div
                                    id="roleKey"
                                    className="flex items-center justify-between rounded-md border border-gray-300 bg-[#F8F6FC] px-3.5 py-2.5 text-sm text-gray-800"
                                >
                                    <span>
                                        {routeRole?.title} · {routeRole?.type}
                                    </span>
                                    <Link
                                        to="/careers"
                                        className="text-xs font-medium text-lumicoria-purple underline underline-offset-4 hover:text-lumicoria-deepPurple"
                                    >
                                        Change
                                    </Link>
                                </div>
                                <input type="hidden" {...register('roleKey')} />
                            </>
                        )}
                    </Field>

                    <div className="rounded-lg border border-gray-200 bg-[#FAFAFD] p-5">
                        <h2 className="mb-1 text-sm font-semibold text-gray-900">Your work</h2>
                        <p className="mb-4 text-xs text-gray-500">
                            Add at least one link, and attach a CV if you have one. This matters far more to us than
                            anything else on the form.
                        </p>

                        <div className="space-y-5">
                            <Field
                                label="Portfolio / website"
                                htmlFor="portfolioUrl"
                                error={errors.portfolioUrl?.message}
                            >
                                <input
                                    id="portfolioUrl"
                                    type="url"
                                    placeholder="https://"
                                    className={inputClass}
                                    {...register('portfolioUrl')}
                                />
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="LinkedIn" htmlFor="linkedinUrl" error={errors.linkedinUrl?.message}>
                                    <input
                                        id="linkedinUrl"
                                        type="url"
                                        placeholder="https://"
                                        className={inputClass}
                                        {...register('linkedinUrl')}
                                    />
                                </Field>
                                <Field
                                    label="CV link"
                                    htmlFor="cvUrl"
                                    hint="Drive, Dropbox, Notion"
                                    error={errors.cvUrl?.message}
                                >
                                    <input
                                        id="cvUrl"
                                        type="url"
                                        placeholder="https://"
                                        className={inputClass}
                                        {...register('cvUrl')}
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Or attach your CV"
                                htmlFor="cvFile"
                                hint="PDF or Word, up to 5MB. Optional if you have linked it above"
                                error={cvError ?? undefined}
                            >
                                <input
                                    id="cvFile"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFile}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-lumicoria-purple/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-lumicoria-purple hover:file:bg-lumicoria-purple/20"
                                />
                                {cvFile && (
                                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-600">
                                        <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                                        {cvFile.name} ({Math.round(cvFile.size / 1024)}KB)
                                    </p>
                                )}
                            </Field>
                        </div>
                    </div>

                    <Field
                        label="Why this role, and what would you want to own?"
                        htmlFor="coverNote"
                        hint="A few honest sentences beat a cover letter. Tell us about something you made."
                        error={errors.coverNote?.message}
                        required
                    >
                        <textarea id="coverNote" rows={6} className={inputClass} {...register('coverNote')} />
                    </Field>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field
                            label="Earliest start"
                            htmlFor="earliestStart"
                            hint="Optional"
                            error={errors.earliestStart?.message}
                        >
                            <input
                                id="earliestStart"
                                placeholder="e.g. immediately, or 4 weeks"
                                className={inputClass}
                                {...register('earliestStart')}
                            />
                        </Field>
                        <Field
                            label="How did you hear about us?"
                            htmlFor="heardFrom"
                            hint="Optional"
                            error={errors.heardFrom?.message}
                        >
                            <input id="heardFrom" className={inputClass} {...register('heardFrom')} />
                        </Field>
                    </div>

                    <div className="space-y-3 rounded-lg border border-gray-200 p-5">
                        <label className="flex gap-3 text-sm text-gray-600">
                            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register('rightToWork')} />
                            <span>
                                I confirm I am legally able to work in the country I am based in.
                                {errors.rightToWork && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        {errors.rightToWork.message}
                                    </span>
                                )}
                            </span>
                        </label>

                        <label className="flex gap-3 text-sm text-gray-600">
                            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register('consent')} />
                            <span>
                                I consent to Lumicoria storing this information to assess my application, for up to 12
                                months. See the{' '}
                                <Link to="/privacy" className="font-medium text-lumicoria-purple underline underline-offset-4 hover:text-lumicoria-deepPurple">
                                    privacy policy
                                </Link>
                                .
                                {errors.consent && (
                                    <span className="mt-1 block text-xs text-red-600">{errors.consent.message}</span>
                                )}
                            </span>
                        </label>
                    </div>

                    {!isCareersEndpointConfigured() && (
                        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                Online applications aren&rsquo;t connected yet. Fill this in and we&rsquo;ll open a
                                prefilled email instead, or write to{' '}
                                <a href={`mailto:${CAREERS_CONTACT_EMAIL}`} className="font-medium underline">
                                    {CAREERS_CONTACT_EMAIL}
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    {/* Submission failed. Hand them the email route rather than a dead end. */}
                    {failedPayload && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                            <p className="mb-3 text-sm text-amber-900">
                                We could not submit that automatically, but your application is not lost.
                                Send it by email instead and it reaches the same place.
                            </p>
                            <a
                                href={buildMailtoFallback(failedPayload)}
                                className="inline-flex items-center gap-2 rounded-md bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-900"
                            >
                                <Mail className="h-4 w-4" aria-hidden="true" />
                                Email my application
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-lumicoria-purple px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-lumicoria-deepPurple disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Sending…' : 'Submit application'}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        We never ask candidates for payment at any stage.
                    </p>
                </form>

                <div className="mx-auto mt-16 max-w-3xl">
                    <CareersLegal />
                </div>
            </section>
        </div>
    );
}
