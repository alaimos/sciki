<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
        <link href="{{ mix('/css/app.css') }}" rel="stylesheet"/>
        @routes
        <script src="{{ mix('/js/manifest.js') }}" defer></script>
        <script src="{{ mix('/js/vendor.js') }}" defer></script>
        <script src="{{ mix('/js/app.js') }}" defer></script>
        <title>{{ config('app.name', 'Laravel') }}</title>
    </head>
    <body>
        @inertia
    </body>
</html>
