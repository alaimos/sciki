<!DOCTYPE html>
<html lang="en" class="perfect-scrollbar-off nav-open">
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        <meta name="theme-color" content="#000000"/>
        <link rel="manifest" href="{{ url('/manifest.json') }}"/>
        <link rel="shortcut icon" href="{{ url('/favicon.ico') }}"/>
        <link rel="apple-touch-icon" sizes="76x76" href="{{ url('/apple-icon.png') }}"/>
        <title>{{ config('app.name', 'SciKi') }}</title>
        <link href="{{ mix('/css/app.css') }}" rel="stylesheet"/>
        @routes
        <script src="{{ mix('/js/manifest.js') }}" defer></script>
        <script src="{{ mix('/js/vendor.js') }}" defer></script>
        <script src="{{ mix('/js/app.js') }}" defer></script>
    </head>
    <body>
        @inertia
    </body>
</html>
