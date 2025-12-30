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
        <div className='min-h-[80vh] flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8 bg-card p-10 rounded-xl shadow-lg border border-border/50'>
                <div className='text-center'>
                    <h2 className='text-3xl font-display font-bold tracking-tight text-foreground'>
                        Welcome Back
                    </h2>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Sign in to continue your journey
                    </p>
                </div>
                <form className='mt-8 space-y-6' onSubmit={onSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-foreground'
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
                                className='mt-1 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-colors'
                                placeholder='Enter your email'
                            />
                        </div>
                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-foreground'
                            >
                                Password
                            </label>
                            <input
                                id='password'
                                name='password'
                                type='password'
                                autoComplete='current-password'
                                required
                                value={password}
                                onChange={onChange}
                                className='mt-1 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-colors'
                                placeholder='Enter your password'
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg'
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className='text-center mt-4'>
                    <p className='text-sm text-muted-foreground'>
                        Don't have an account?{' '}
                        <Link to='/register' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
