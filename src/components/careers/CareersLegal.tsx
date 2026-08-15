import { ShieldCheck, Scale, Accessibility, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAREERS_CONTACT_EMAIL } from '@/data/careers';

/**
 * Equal opportunity, accommodations, candidate privacy, and an anti-scam
 * notice. Shown on the careers index and on the application page — the two
 * places a candidate decides whether to trust us with their data.
 */
export function CareersLegal() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-lumicoria-purple" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-900">Equal opportunity</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500">
                    Lumicoria Inc. is an equal opportunity employer. We consider every qualified applicant without
                    regard to race, colour, ethnicity, national origin, religion, sex, gender identity or expression,
                    sexual orientation, age, disability, marital or veteran status, or any other characteristic
                    protected by applicable law. We hire on evidence of ability and on nothing else.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                    <Accessibility className="h-5 w-5 text-lumicoria-purple" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-900">Accommodations</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500">
                    If you need an adjustment at any point in the process — a different format, extra time, or
                    anything else that lets you do your best work — write to{' '}
                    <a
                        href={`mailto:${CAREERS_CONTACT_EMAIL}`}
                        className="font-medium text-lumicoria-purple hover:underline"
                    >
                        {CAREERS_CONTACT_EMAIL}
                    </a>
                    . Asking will never count against you.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-lumicoria-purple" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-900">Your data</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500">
                    We collect only what we need to assess your application, and we use it for that purpose alone. We
                    keep it for up to 12 months so we can contact you about future roles, then delete it. You can ask
                    us to delete it sooner at any time by emailing{' '}
                    <a
                        href={`mailto:${CAREERS_CONTACT_EMAIL}`}
                        className="font-medium text-lumicoria-purple hover:underline"
                    >
                        {CAREERS_CONTACT_EMAIL}
                    </a>
                    . See our{' '}
                    <Link to="/privacy" className="font-medium text-lumicoria-purple hover:underline">
                        privacy policy
                    </Link>{' '}
                    for the full detail.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-lumicoria-purple" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-900">Beware of recruitment scams</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500">
                    We will <strong className="font-semibold text-gray-700">never</strong> ask you for payment, bank
                    details, or equipment fees at any stage of hiring. Every genuine message from us comes from an{' '}
                    <span className="font-medium text-gray-700">@lumicoria.ai</span> address. If something looks off,
                    contact us directly before responding.
                </p>
            </div>
        </div>
    );
}

export default CareersLegal;
