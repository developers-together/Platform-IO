<script>
    import { Link, page } from '@inertiajs/svelte';
    import { onMount } from 'svelte';
    import AppHead from '@/components/AppHead.svelte';

    // let {
    //     canRegister = true,
    // } = $props();

    const auth = $derived($page.props.auth);

    // change this to true in order to show the welcome overlay
    let showOverlay = $state(false);
    let fadingOut = $state(false);

    onMount(() => {
        const fadeTimer = setTimeout(() => {
            fadingOut = true;
            setTimeout(() => {
                showOverlay = false;
            }, 1000);
        }, 2400);

        // this is kinda improtant (shehab will kill me)
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                fadingOut = true;
                setTimeout(() => {
                    showOverlay = false;
                }, 1000);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            clearTimeout(fadeTimer);
            window.removeEventListener('keydown', onKeyDown);
        };
    });
</script>

<AppHead title="Platform-IO" />

<div class="start5">
    {#if showOverlay}
        <div class="overlay" class:fade-out={fadingOut}>
            <div class="overlay-content">
                <p class="overlay-title">Hello, and Welcome to Platform-IO</p>
            </div>
        </div>
    {/if}

    <div class="starter-page5">
        <div class="starter-content5">
            <h1>Platform-IO</h1>
            <p>Where Ideas Sync, Teams Thrive, and Work Comes Alive</p>
            <p>Your All-in-One Hub for Smarter Collaboration.</p>

            {#if auth?.user}
                <Link href="/dashboard" class="btn-custom5">Go to Dashboard</Link>
            {:else}
                <div class="cta-row">
                    <Link href="/login" class="btn-custom5">Use the Platform</Link>
                    <!-- {#if canRegister}
                        <Link href="/register" class="btn-secondary5">Create account</Link>
                    {/if} -->
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .start5 {
        height: 100vh;
        width: 100%;
        margin: 0;
        padding: 0;
        background: url('/landing.png') center center no-repeat;
        background-size: cover;
        display: flex;
        align-items: center;
    }

    .starter-page5 {
        display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .starter-content5 {
        text-align: center;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 420px;
        position: relative;
        margin-right: 5%;
    }

    .starter-content5 h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #fff;
    }

    .starter-content5 p {
        font-size: 1.05rem;
        color: rgba(255, 255, 255, 0.75);
        margin-bottom: 1rem;
    }

    .cta-row {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 1rem;
    }

    :global(.btn-custom5) {
        color: #fff;
        background: #2b5ce7;
        padding: 14px 34px;
        letter-spacing: 1px;
        font-size: 15px;
        font-weight: 500;
        border-radius: 25px;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 6px 20px rgba(0, 82, 212, 0.4);
        text-decoration: none;
        display: inline-block;
    }

    :global(.btn-secondary5) {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
        padding: 14px 24px;
        letter-spacing: 0.4px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 25px;
        transition: all 0.2s ease-in-out;
        border: 1px solid rgba(255, 255, 255, 0.4);
        text-decoration: none;
        display: inline-block;
    }

    :global(.btn-custom5:hover),
    :global(.btn-custom5:focus),
    :global(.btn-secondary5:hover),
    :global(.btn-secondary5:focus) {
        transform: scale(1.05);
    }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        z-index: 10000;
    }

    .overlay.fade-out {
        opacity: 0;
        pointer-events: none;
    }

    .overlay-content {
        padding: 2rem;
        text-align: center;
    }

    .overlay-title {
        font-size: 2rem;
        font-weight: 600;
        color: #fff;
    }

    @media (max-width: 768px) {
        .overlay-title {
            font-size: 1.4rem;
        }

        .starter-content5 {
            width: 90%;
            margin-right: auto;
            margin-left: auto;
        }

        .starter-page5 {
            justify-content: center;
        }

        .starter-content5 h1 {
            font-size: 2rem;
        }

        .starter-content5 p {
            font-size: 0.95rem;
        }
    }

    @media (max-width: 480px) {
        .overlay-title {
            font-size: 1.1rem;
        }

        .starter-content5 h1 {
            font-size: 1.6rem;
        }

        .starter-content5 p {
            font-size: 0.85rem;
        }

        :global(.btn-custom5),
        :global(.btn-secondary5) {
            padding: 12px 20px;
            font-size: 13px;
        }
    }
</style>
