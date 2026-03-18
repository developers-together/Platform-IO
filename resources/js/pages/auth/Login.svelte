<script>
    import { Form, router } from '@inertiajs/svelte';
    import AppHead from '@/components/AppHead.svelte';
    import { store } from '@/routes/login';

    // Props are injected by the backend guest login route.
    let {
        status = '',
        canResetPassword = true,
        canRegister = true,
    } = $props();

    const forgotPasswordPath = '/forgot-password';
    const registerPath = '/register';

    // Route helper generated from Laravel routes.
    // `store.form()` points to POST /login handled by Fortify.
    const hasErrors = (errors) => Boolean(errors?.email || errors?.password);

    // Keep post-auth UX deterministic from frontend side as requested.
    // We only redirect when a user is actually authenticated.
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

<AppHead title="Login" />

<div class="login-container" data-test="login-page">
    <div class="login-card" data-test="login-card">
        <div class="login-header">
            <h2 class="login-title">Welcome Back</h2>
            <p class="login-subtitle">Sign in to continue</p>
        </div>

        {#if status}
            <div class="success-message2">{status}</div>
        {/if}

        <!-- Submit directly to backend auth endpoint -->
        <Form
            {...store.form()}
            class="login-form"
            resetOnError={['password']}
            options={{ preserveScroll: true }}
            onSuccess={redirectToDashboardIfAuthenticated}
        >
            {#snippet children({ errors, processing })}
                {#if hasErrors(errors)}
                    <div class="error-message2">
                        <svg class="error-icon2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{errors.email ?? errors.password}</span>
                    </div>
                {/if}

                <div class="input-group">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input
                        type="email"
                        name="email"
                        data-test="login-email-input"
                        class="login-input"
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
                        data-test="login-password-input"
                        class="login-input"
                        placeholder="Password"
                        required
                        autocomplete="current-password"
                    />
                </div>
                {#if errors.password}
                    <p class="field-error">{errors.password}</p>
                {/if}

                <!-- Fortify reads `remember=1` when checked -->
                <div class="remember-row">
                    <label class="remember-label">
                        <input type="checkbox" name="remember" value="1" />
                        <span>Remember me</span>
                    </label>
                </div>

                <button type="submit" class="login-button" data-test="login-submit-button" disabled={processing}>
                    {#if processing}
                        <div class="spinner"></div>
                    {:else}
                        Sign In
                    {/if}
                </button>
            {/snippet}
        </Form>

        {#if canResetPassword}
            <p class="login-footer">
                Forgot your password?
                <a href={forgotPasswordPath} class="register-link">Reset it</a>
            </p>
        {/if}

        {#if canRegister}
            <p class="login-footer">
                Don't have an account?
                <a href={registerPath} class="register-link">Create Account</a>
            </p>
        {/if}
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        background-image: url('/WelcomeBack.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    .login-card {
        padding: 40px;
        width: 100%;
        max-width: 440px;
        transform: translateY(0);
        animation: cardEnter 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 17%;
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

    .login-header {
        margin-bottom: 30px;
        text-align: center;
    }

    .login-title {
        font-size: 2.2rem;
        color: white;
        margin-bottom: 8px;
        font-weight: 700;
    }

    .login-subtitle {
        color: #cdcdcd;
        font-size: 0.95rem;
    }

    :global(.login-form) {
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

    .field-error {
        margin: -4px 0 10px;
        color: #fecaca;
        font-size: 0.82rem;
        padding-left: 6px;
        width: 100%;
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

    .login-input {
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

    .login-input:focus {
        border-color: rgba(30, 64, 175, 0.6);
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        outline: none;
    }

    .login-input::placeholder {
        color: #64748b;
    }

    .login-input:-webkit-autofill,
    .login-input:-webkit-autofill:hover,
    .login-input:-webkit-autofill:focus {
        -webkit-text-fill-color: #0f172a;
        transition: background-color 9999s ease-out 0s;
    }

    .error-message2 {
        background: #fff0f0;
        color: #dc2626;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
        animation: slideDown 0.3s ease;
        width: 100%;
        justify-content: center;
    }

    .success-message2 {
        background: #f0fff4;
        color: #22c55e;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 15px;
        width: 100%;
        text-align: center;
        font-size: 0.9rem;
    }

    .error-icon2 {
        min-width: 20px;
    }

    @keyframes slideDown {
        0% {
            opacity: 0;
            transform: translateY(-10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .login-button {
        background: linear-gradient(135deg, #0052d4, #4364f7);
        color: white;
        padding: 16px;
        border-radius: 12px;
        font-size: 1.2rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all 0.2s ease-in-out;
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 6px 20px rgba(0, 82, 212, 0.4);
        cursor: pointer;
    }

    .remember-row {
        width: 100%;
        margin: 4px 0 8px;
    }

    .remember-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #f8fafc;
        font-size: 0.86rem;
        cursor: pointer;
    }

    .remember-label input {
        width: 15px;
        height: 15px;
        accent-color: #2b5ce7;
    }

    .login-button:hover:not(:disabled) {
        transform: scale(1.02);
        box-shadow: 0 0 20px rgba(0, 82, 212, 0.8);
    }

    .login-button:disabled {
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

    .login-footer {
        margin-top: 20px;
        text-align: center;
        width: 100%;
        color: #f0fff4;
    }

    .register-link {
        transition: all 0.2s ease;
        color: #0052d4;
        cursor: pointer;
        font-weight: 600;
        margin-left: 5px;
        text-decoration: none;
    }

    .register-link:hover {
        color: #003a9b;
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .login-container {
            justify-content: center;
            padding: 20px;
        }

        .login-card {
            margin-right: 0;
            padding: 30px 20px;
            max-width: 100%;
        }

        .login-title {
            font-size: 1.6rem;
        }
    }

    @media (max-width: 480px) {
        .login-card {
            padding: 24px 16px;
        }

        .login-title {
            font-size: 1.4rem;
        }

        .login-input {
            padding: 12px 12px 12px 40px;
            font-size: 0.9rem;
        }

        .login-button {
            font-size: 1rem;
            padding: 14px;
        }
    }
</style>
