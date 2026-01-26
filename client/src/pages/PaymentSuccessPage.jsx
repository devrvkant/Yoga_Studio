import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useGetMeQuery } from '../features/auth/authApi';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refetch } = useGetMeQuery();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Refetch user data to get updated enrollments
        refetch();

        // Trigger confetti
        const duration = 2 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#0d9488', '#14b8a6', '#2dd4bf']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#0d9488', '#14b8a6', '#2dd4bf']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // Show content with animation
        setTimeout(() => setShowContent(true), 300);
    }, [refetch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
            <div
                className={`max-w-lg w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center transform transition-all duration-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
            >
                {/* Success Icon */}
                <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-8 h-8 text-amber-400" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-display font-bold text-foreground mb-3">
                    Payment Successful!
                </h1>
                <p className="text-lg text-muted mb-8">
                    Thank you for your purchase. Your access has been activated.
                </p>

                {/* What's Next */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <PartyPopper className="text-amber-500" size={20} />
                        What's Next?
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                            <span className="text-muted">Your content is now available in your dashboard</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                            <span className="text-muted">A confirmation email has been sent to your inbox</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                            <span className="text-muted">Start your yoga journey anytime, anywhere</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 text-base font-semibold"
                    >
                        Go to My Dashboard
                        <ArrowRight className="ml-2" size={18} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full py-5"
                    >
                        Back to Home
                    </Button>
                </div>

                {/* Support */}
                <p className="text-xs text-muted mt-8">
                    Need help? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
                </p>
            </div>
        </div>
    );
}
