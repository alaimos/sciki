// eslint-disable-next-line @typescript-eslint/no-var-requires
const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.webpackConfig({
    module: {
        rules: [
            {
                enforce: "pre",
                exclude: /node_modules/,
                loader: "eslint-loader",
                test: /\.(js|ts|tsx)?$/,
            },
        ],
    },
    output: {
        chunkFilename: "js/[name].js?id=[chunkhash]",
    },
})
    .extract()
    .ts("resources/js/app.tsx", "public/js")
    .sourceMaps()
    .sass("resources/sass/app.scss", "public/css");
