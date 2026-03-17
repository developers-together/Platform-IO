<script>
  import { goto } from '$app/navigation';
  import { token, user } from '$lib/stores/auth.js';
  import { api } from '$lib/api/client.js';

  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    isLoading = true;

    try {
      const data = await api('/login', {
        method: 'POST',
        body: { email, password },
      });
      $token = data.token;
      $user = data.user;
      goto('/teams');
    } catch (err) {
      error = err.message || 'Invalid email or password. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login — Platform-IO</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <h2 class="login-title">Welcome Back</h2>
      <p class="login-subtitle">Sign in to continue</p>
    </div>

    {#if error}
      <div class="error-message2">
        <svg class="error-icon2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{error}</span>
      </div>
    {/if}

    <form on:submit={handleLogin} class="login-form">
      <div class="input-group">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <input
          type="email"
          class="login-input"
          placeholder="Email"
          bind:value={email}
          required
        />
      </div>

      <div class="input-group">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <input
          type="password"
          class="login-input"
          placeholder="Password"
          bind:value={password}
          required
        />
      </div>

      <button type="submit" class="login-button" disabled={isLoading}>
        {#if isLoading}
          <div class="spinner"></div>
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <p class="login-footer">
      Don't have an account?
      <a href="/register" class="register-link">Create Account</a>
    </p>
  </div>
</div>

<style>
  /* Login container — exact React CSS */
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

  .login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .input-group {
    position: relative;
    margin-bottom: 15px;
    width: 100%;
  }

  .input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    width: 20px;
    height: 20px;
  }

  .login-input {
    padding: 14px 14px 14px 40px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease-in-out;
    width: 100%;
  }

  .login-input:focus {
    border-color: #0052d4;
    box-shadow: 0 6px 20px rgba(0, 82, 212, 0.2);
    outline: none;
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
    width: 68%;
    justify-content: center;
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

  .login-button:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 0px 20px rgba(0, 82, 212, 0.8);
  }
  .login-button:active:not(:disabled) {
    transform: scale(0.9);
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
    to { transform: rotate(360deg); }
  }

  .login-footer {
    margin-top: 25px;
    text-align: center;
    width: 100%;
    transition: all 0.2s ease-in-out;
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

  /* Mobile responsive */
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
      padding: 12px 12px 12px 36px;
      font-size: 0.9rem;
    }
    .login-button {
      font-size: 1rem;
      padding: 14px;
    }
  }
</style>
