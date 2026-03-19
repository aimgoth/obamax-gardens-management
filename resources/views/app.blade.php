<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="logo-url" content="{{ asset('logo.png') }}">
        <link rel="icon" type="image/png" href="{{ asset('logo.png') }}">
        <link rel="shortcut icon" type="image/png" href="{{ asset('logo.png') }}">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Obamax Gardens') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        @if (!str_contains(request()->userAgent() ?? '', 'Electron'))
            <a
                href="{{ route('download.desktop.zip') }}"
                style="
                    position: fixed;
                    right: 18px;
                    bottom: 18px;
                    z-index: 9999;
                    background: linear-gradient(135deg, #16a34a, #059669);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 16px;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.25);
                "
                title="Download Obamax Desktop App"
            >
                Download Desktop App
            </a>
        @endif
    </body>
</html>
