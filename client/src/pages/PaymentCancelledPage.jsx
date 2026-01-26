import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function PaymentCancelledPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-border-soft p-8 text-center">
                {/* Cancel Icon */}
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-slate-500" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-display font-bold text-foreground mb-3">
                    Payment Cancelled
                </h1>
                <p className="text-muted mb-8">
                    Your payment was not processed. No charges were made to your account.
                </p>

                {/* Reasons */}
                <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <HelpCircle size={18} className="text-muted" />
                        Common reasons for cancellation:
                    </h3>
                    <ul className="text-sm text-muted space-y-2">
                        <li>• You chose to cancel during checkout</li>
                        <li>• Payment was declined by your bank</li>
                        <li>• Session timed out</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate(-1)}
                        className="w-full py-5"
                    >
                        <ArrowLeft className="mr-2" size={18} />
                        Try Again
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
                    Having trouble? <a href="/contact" className="text-primary hover:underline">Contact our support</a>
                </p>
            </div>
        </div>
    );
}
