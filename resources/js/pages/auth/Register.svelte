<script>
    import { Form, router } from '@inertiajs/svelte';
    import AppHead from '@/components/AppHead.svelte';
    import { store } from '@/routes/register';

    // Keep links explicit so auth navigation stays predictable.
    const loginPath = '/login';

    // Route helper generated from Laravel routes.
    // `store.form()` points to POST /register handled by Fortify.
    const hasErrors = (errors) =>
        Boolean(
            errors?.name ||
                errors?.email ||
                errors?.password ||
                errors?.password_confirmation,
        );

    // After successful registration, move authenticated users to dashboard.
    function redirectToDashboardIfAuthenticated(inertiaPage) {
        const authenticatedUser = inertiaPage?.props?.auth?.user;
        const componentName = inertiaPage?.component ?? '';

        if (!authenticatedUser || componentName === 'Dashboard') {
            return;
        }

        router.visit('/dashboard', {
            replace: true,
            preserveState: false,
            preserveScroll: false,
        });
    }
</script>

<AppHead title="Register" />

<div class="register-container" data-test="register-page">
    <div class="register-card" data-test="register-card">
        <div class="register-header">
            <h2 class="register-title">Create Account</h2>
            <p class="register-subtitle">Get started with your free account</p>
        </div>

        <!-- Submit directly to backend register endpoint -->
        <Form
            {...store.form()}
            resetOnSuccess={['password', 'password_confirmation']}
            resetOnError={['password', 'password_confirmation']}
            options={{ preserveScroll: true }}
            class="register-form"
            onSuccess={redirectToDashboardIfAuthenticated}
        >
            {#snippet children({ errors, processing })}
                {#if hasErrors(errors)}
                    <div class="error-message" role="alert">
                        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{errors.name ?? errors.email ?? errors.password ?? errors.password_confirmation}</span>
                    </div>
                {/if}

                <div class="input-group">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input
                        type="text"
                        name="name"
                        data-test="register-name-input"
                        class="register-input"
                        placeholder="Name"
                        required
                        autocomplete="name"
                    />
                </div>
                {#if errors.name}
                    <p class="field-error">{errors.name}</p>
                {/if}

                <div class="input-group">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input
                        type="email"
                        name="email"
                        data-test="register-email-input"
                        class="register-input"
                        placeholder="Email"
                        required
                        autocomplete="email"
                    />
                </div>
                {#if errors.email}
                    <p class="field-error">{errors.email}</p>
                {/if}

                <div class="input-group">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                        type="password"
                        name="password"
                        data-test="register-password-input"
                        class="register-input"
                        placeholder="Password"
                        required
                        autocomplete="new-password"
                    />
                </div>
                {#if errors.password}
                    <p class="field-error">{errors.password}</p>
                {/if}

                <div class="input-group">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                        type="password"
                        name="password_confirmation"
                        data-test="register-password-confirmation-input"
                        class="register-input"
                        placeholder="Confirm Password"
                        required
                        autocomplete="new-password"
                    />
                </div>
                {#if errors.password_confirmation}
                    <p class="field-error">{errors.password_confirmation}</p>
                {/if}

                <button type="submit" class="register-button" data-test="register-submit-button" disabled={processing}>
                    {#if processing}
                        <div class="spinner"></div>
                    {:else}
                        Create Account
                    {/if}
                </button>
            {/snippet}
        </Form>

        <p class="register-footer">
            Already have an account?
            <a href={loginPath} class="login-link">Sign In</a>
        </p>
    </div>
</div>

<style>
    .register-container {
        display: flex;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        background-image: url('/WelcomeOnboard.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    .register-card {
        padding: 40px;
        width: 100%;
        max-width: 440px;
        transform: translateY(0);
        animation: cardEnter 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: 17%;
        border-radius: 20px;
    }

    @keyframes cardEnter {
        0% {
            transform: translateY(20px);
            opacity: 0;
        }

        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .register-header {
        margin-bottom: 30px;
        text-align: center;
    }

    .register-title {
        font-size: 2.2rem;
        color: white;
        margin-bottom: 8px;
        font-weight: 700;
    }

    .register-subtitle {
        color: #cdcdcd;
        font-size: 0.95rem;
    }

    :global(.register-form) {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .input-group {
        position: relative;
        margin-bottom: 14px;
        width: 100%;
        border-radius: 14px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .input-group:focus-within {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(8, 34, 102, 0.22);
    }

    .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #6b7280;
        width: 20px;
        height: 20px;
        pointer-events: none;
        transition: color 0.2s ease;
    }

    .input-group:focus-within .input-icon {
        color: #1e40af;
    }

    .field-error {
        margin: -4px 0 10px;
        color: #fecaca;
        font-size: 0.82rem;
        padding-left: 6px;
        width: 100%;
    }

    .register-input {
        padding: 14px 14px 14px 44px;
        border-radius: 14px;
        border: 1.5px solid rgba(15, 23, 42, 0.14);
        font-size: 1rem;
        color: #0f172a;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.97),
            rgba(248, 250, 252, 0.96)
        );
        transition: border-color 0.2s ease, box-shadow 0.2s ease,
            background-color 0.2s ease;
        width: 100%;
        appearance: none;
        -webkit-appearance: none;
    }

    .register-input:focus {
        border-color: rgba(30, 64, 175, 0.6);
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        outline: none;
    }

    .register-input::placeholder {
        color: #64748b;
    }

    .register-input:-webkit-autofill,
    .register-input:-webkit-autofill:hover,
    .register-input:-webkit-autofill:focus {
        -webkit-text-fill-color: #0f172a;
        transition: background-color 9999s ease-out 0s;
    }

    .error-message {
        background: #fff0f0;
        color: #dc2626;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
        width: 100%;
        justify-content: center;
    }

    .register-button {
        background: linear-gradient(135deg, #0052d4, #4364f7);
        color: white;
        padding: 16px;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all 0.2s ease-in-out;
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        cursor: pointer;
    }

    .register-button:hover:not(:disabled) {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(0, 82, 212, 0.2);
    }
    .register-button:focus-visible {
        outline: 2px solid #93c5fd;
        outline-offset: 2px;
    }

    .register-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .register-footer {
        margin-top: 25px;
        text-align: center;
        width: 100%;
        color: #f0fff4;
    }

    .login-link {
        margin-left: 5px;
        transition: all 0.2s ease-in-out;
        color: #0052d4;
        cursor: pointer;
        font-weight: 600;
        text-decoration: none;
    }

    .login-link:hover {
        color: #003a9b;
        text-decoration: underline;
    }
    .login-link:focus-visible {
        outline: 2px solid #93c5fd;
        outline-offset: 2px;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        .register-container {
            justify-content: center;
            padding: 20px;
        }

        .register-card {
            margin-left: 0;
            padding: 30px 20px;
            max-width: 100%;
        }

        .register-title {
            font-size: 1.6rem;
        }
    }

    @media (max-width: 480px) {
        .register-card {
            padding: 24px 16px;
        }

        .register-title {
            font-size: 1.4rem;
        }

        .register-input {
            padding: 12px 12px 12px 40px;
            font-size: 0.9rem;
        }

        .register-button {
            font-size: 1rem;
            padding: 14px;
        }
    }
</style>
