import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ShoppingCart, ArrowLeft, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetCheckoutUrlMutation } from '../features/payment/paymentApi';
import { useGetClassQuery } from '../features/admin/class/classApi';
import { useGetCourseQuery } from '../features/admin/course/courseApi';
import { useGetMeQuery } from '../features/auth/authApi';
import { Button } from '../components/ui/Button';

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const itemType = searchParams.get('type'); // 'class' or 'course'
    const itemId = searchParams.get('id');

    const { data: userData, isLoading: userLoading } = useGetMeQuery();
    const [getCheckoutUrl, { isLoading: checkoutLoading }] = useGetCheckoutUrlMutation();
    const [redirecting, setRedirecting] = useState(false);

    // Fetch item details based on type
    const { data: classData, isLoading: classLoading } = useGetClassQuery(itemId, {
        skip: itemType !== 'class' || !itemId
    });
    const { data: courseData, isLoading: courseLoading } = useGetCourseQuery(itemId, {
        skip: itemType !== 'course' || !itemId
    });

    const item = itemType === 'class' ? classData?.data : courseData?.data;
    const isLoading = userLoading || classLoading || courseLoading;

    useEffect(() => {
        if (!itemType || !itemId) {
            toast.error('Invalid checkout link');
            navigate('/');
        }
    }, [itemType, itemId, navigate]);

    useEffect(() => {
        if (!userLoading && !userData?.data) {
            toast.error('Please login to continue');
            navigate(`/login?redirect=/checkout?type=${itemType}&id=${itemId}`);
        }
    }, [userData, userLoading, navigate, itemType, itemId]);

    const handleProceedToPayment = async () => {
        try {
            setRedirecting(true);
            const response = await getCheckoutUrl({ itemType, itemId }).unwrap();

            if (response.success && response.data.checkoutUrl) {
                // Redirect to Digistore24 checkout
                window.location.href = response.data.checkoutUrl;
            } else {
                throw new Error('Failed to get checkout URL');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error?.data?.message || 'Failed to proceed to payment');
            setRedirecting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-foreground mb-4">Item not found</p>
                    <Button onClick={() => navigate('/')}>Go Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-border-soft py-4">
                <div className="container mx-auto px-6 max-w-5xl">
                    <Link
                        to={itemType === 'class' ? '/classes' : '/courses'}
                        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to {itemType === 'class' ? 'Classes' : 'Courses'}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Order Summary - Left Side */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-border-soft overflow-hidden">
                            <div className="p-6 border-b border-border-soft">
                                <h1 className="text-2xl font-display font-bold text-foreground">
                                    Complete Your Purchase
                                </h1>
                                <p className="text-muted mt-1">
                                    You're one step away from starting your journey
                                </p>
                            </div>

                            {/* Item Details */}
                            <div className="p-6">
                                <div className="flex gap-6">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-32 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                                            {itemType === 'class' ? 'Yoga Class' : 'Course'}
                                        </span>
                                        <h2 className="text-xl font-bold text-foreground mt-1">
                                            {item.title}
                                        </h2>
                                        <p className="text-sm text-muted mt-2 line-clamp-2">
                                            {item.description}
                                        </p>
                                        {item.instructor && (
                                            <p className="text-sm text-muted mt-2">
                                                Instructor: <span className="text-foreground">{item.instructor}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* What's Included */}
                                {itemType === 'course' && item.learnPoints?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-border-soft">
                                        <h3 className="font-semibold text-foreground mb-3">What you'll learn:</h3>
                                        <ul className="space-y-2">
                                            {item.learnPoints.slice(0, 4).map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                                                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 flex items-center gap-3 text-sm text-muted">
                            <Shield className="text-emerald-600" size={20} />
                            <span>Secure checkout powered by Digistore24. Your payment information is protected.</span>
                        </div>
                    </div>

                    {/* Payment Summary - Right Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-border-soft p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-foreground mb-6">Order Summary</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">{itemType === 'class' ? 'Class' : 'Course'}</span>
                                    <span className="text-foreground">€{item.price?.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-border-soft pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-primary">€{item.price?.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-muted mt-1">One-time payment</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleProceedToPayment}
                                disabled={checkoutLoading || redirecting}
                                className="w-full mt-6 py-6 text-base font-semibold"
                            >
                                {redirecting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Redirecting to Payment...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Proceed to Payment
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted mt-4">
                                By completing this purchase, you agree to our Terms of Service
                            </p>

                            <div className="mt-6 pt-6 border-t border-border-soft">
                                <p className="text-xs text-muted text-center mb-3 font-medium">Accepted Payment Methods</p>
                                <div className="flex justify-center gap-6 items-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="h-4 object-contain" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-6 object-contain" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
