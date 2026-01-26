import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'sonner';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const userData = await login({ email, password }).unwrap();
            dispatch(setCredentials(userData.data));
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            console.error('Login Error:', err);
            const errorMessage = err?.data?.message || err?.data?.error || err?.error || 'Login failed';
            toast.error(errorMessage);
        }
    };

    return (
        <div className='min-h-screen flex bg-background'>
            {/* Left Side - Image & Branding */}
            <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden'>
                <div
                    className='absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[20s]'
                    style={{ backgroundImage: `url('/src/assets/images/hero.jpg')` }}
                ></div>
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 flex flex-col justify-end p-16 text-white'>
                    <div className='relative z-10 max-w-lg'>
                        <h1 className='text-5xl font-display font-bold mb-6 leading-tight'>
                            Lead. Level Up.<br />
                            <span className='text-primary-soft'>Become a Legend.</span>
                        </h1>
                        <p className='text-lg text-gray-200 font-light leading-relaxed mb-8'>
                            Your path to mastering yoga and finding your inner balance starts here. Join our community of dedicated practitioners.
                        </p>
                        <div className='flex gap-4'>
                            <div className='h-1 w-12 bg-primary rounded-full'></div>
                            <div className='h-1 w-4 bg-white/30 rounded-full'></div>
                            <div className='h-1 w-4 bg-white/30 rounded-full'></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-card'>
                <div className='w-full max-w-md space-y-10'>
                    <div className='text-center lg:text-left'>
                        <h2 className='text-4xl font-display font-bold tracking-tight text-foreground'>
                            Welcome Back
                        </h2>
                        <p className='mt-3 text-base text-muted-foreground'>
                            Log in to continue your journey.
                        </p>
                    </div>

                    <form className='mt-8 space-y-6' onSubmit={onSubmit}>
                        <div className='space-y-6'>
                            <div className='group'>
                                <label
                                    htmlFor='email'
                                    className='block text-sm font-medium text-foreground mb-2 group-focus-within:text-primary transition-colors'
                                >
                                    Email address
                                </label>
                                <input
                                    id='email'
                                    name='email'
                                    type='email'
                                    autoComplete='email'
                                    required
                                    value={email}
                                    onChange={onChange}
                                    className='block w-full rounded-xl border border-input bg-background/50 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all duration-300'
                                    placeholder='Enter your email'
                                />
                            </div>
                            <div className='group'>
                                <div className='flex items-center justify-between mb-2'>
                                    <label
                                        htmlFor='password'
                                        className='block text-sm font-medium text-foreground group-focus-within:text-primary transition-colors'
                                    >
                                        Password
                                    </label>
                                    <div className='text-sm'>
                                        <a href='#' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                                <input
                                    id='password'
                                    name='password'
                                    type='password'
                                    autoComplete='current-password'
                                    required
                                    value={password}
                                    onChange={onChange}
                                    className='block w-full rounded-xl border border-input bg-background/50 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm transition-all duration-300'
                                    placeholder='Enter your password'
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className='group relative flex w-full justify-center rounded-xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                            >
                                {isLoading ? (
                                    <span className='flex items-center gap-2'>
                                        <svg className="animate-spin -ml-1 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </div>
                    </form>

                    <div className='text-center pt-2'>
                        <p className='text-sm text-muted-foreground'>
                            Don't have an account?{' '}
                            <Link to='/register' className='font-semibold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4'>
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
