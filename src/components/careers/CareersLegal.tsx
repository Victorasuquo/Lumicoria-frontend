import { Link } from 'react-router-dom';
import { CAREERS_CONTACT_EMAIL } from '@/data/careers';

const linkClass = 'text-lumicoria-purple underline underline-offset-4 hover:text-lumicoria-deepPurple';

/**
 * Equal opportunity, adjustments, candidate data, and an anti scam notice.
 * Shown on the careers index and on the application page, which are the two
 * points where a candidate decides whether to trust us with their details.
 *
 * Plain prose on purpose. Icons and cards would decorate information that
 * people need to actually read.
 */
export function CareersLegal() {
    return (
        <div className="grid gap-10 sm:grid-cols-2">
            <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Equal opportunity</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                    Lumicoria Inc. is an equal opportunity employer. We consider every qualified applicant without
                    regard to race, colour, ethnicity, national origin, religion, sex, gender identity or expression,
                    sexual orientation, age, disability, marital or veteran status, or any other characteristic
                    protected by applicable law. We hire on evidence of ability.
                </p>
            </section>

            <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Adjustments</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                    If you need an adjustment at any point in the process, whether that is a different format, extra
                    time, or anything else that lets you do your best work, write to{' '}
                    <a href={`mailto:${CAREERS_CONTACT_EMAIL}`} className={linkClass}>
                        {CAREERS_CONTACT_EMAIL}
                    </a>
                    . Asking will never count against you.
                </p>
            </section>

            <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Your data</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                    We collect only what we need to assess your application and use it for that purpose alone. We keep
                    it for up to 12 months so we can contact you about future roles, then delete it. You can ask us to
                    delete it sooner at any time by writing to{' '}
                    <a href={`mailto:${CAREERS_CONTACT_EMAIL}`} className={linkClass}>
                        {CAREERS_CONTACT_EMAIL}
                    </a>
                    . Our{' '}
                    <Link to="/privacy" className={linkClass}>
                        privacy policy
                    </Link>{' '}
                    has the full detail.
                </p>
            </section>

            <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Recruitment scams</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                    We will never ask you for payment, bank details, or equipment fees at any stage of hiring. Every
                    genuine message from us comes from an lumicoria.ai address. If something looks wrong, contact us
                    directly before responding.
                </p>
            </section>
        </div>
    );
}

export default CareersLegal;
