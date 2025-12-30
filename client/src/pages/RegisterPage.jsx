import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'sonner';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [register, { isLoading }] = useRegisterMutation();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const userData = await register({ name, email, password }).unwrap();
            dispatch(setCredentials(userData.data));
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMessage = err?.data?.message || err?.data?.error || err?.error || 'Registration failed';
            toast.error(errorMessage);
        }
    }

    return (
        <div className='min-h-[85vh] flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8 bg-card p-10 rounded-xl shadow-lg border border-border/50'>
                <div className='text-center'>
                    <h2 className='text-3xl font-display font-bold tracking-tight text-foreground'>
                        Join Serenity Yoga
                    </h2>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Start your wellness journey today
                    </p>
                </div>
                <form className='mt-8 space-y-6' onSubmit={onSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-foreground'
                            >
                                Full Name
                            </label>
                            <input
                                id='name'
                                name='name'
                                type='text'
                                autoComplete='name'
                                required
                                value={name}
                                onChange={onChange}
                                className='mt-1 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-colors'
                                placeholder='Enter your full name'
                            />
                        </div>
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
                                required
                                value={password}
                                onChange={onChange}
                                className='mt-1 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-colors'
                                placeholder='Create a password'
                            />
                        </div>
                        <div>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-foreground'
                            >
                                Confirm Password
                            </label>
                            <input
                                id='confirmPassword'
                                name='confirmPassword'
                                type='password'
                                required
                                value={confirmPassword}
                                onChange={onChange}
                                className='mt-1 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm shadow-sm transition-colors'
                                placeholder='Confirm your password'
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg'
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className='text-center mt-4'>
                    <p className='text-sm text-muted-foreground'>
                        Already have an account?{' '}
                        <Link to='/login' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
