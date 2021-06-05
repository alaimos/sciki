import React from "react";
import { render } from "react-dom";
import { InertiaApp } from "@inertiajs/inertia-react";
import { InertiaProgress } from "@inertiajs/progress";
import Dashboard from "./Components/Layout/Dashboard";
import { pluginRegex } from "./Common/pluginResolver";
import "./Common/axios";
import "../css/nucleo/css/nucleo.css";

InertiaProgress.init({
    showSpinner: true,
});

const app = document.getElementById("app");
const DefaultLayout = (page: React.ReactNode) => <Dashboard>{page}</Dashboard>;

render(
    <InertiaApp
        initialPage={app ? JSON.parse(app.dataset.page ?? "") : "{}"}
        resolveComponent={(name) => {
            if (name.startsWith("@")) {
                const match = name.match(pluginRegex);
                if (!match) return Promise.reject();
                const plugin = match[1];
                const path = match[2].replace(/^\//, "");
                return import(`./Modules/${plugin}/Pages/${path}`).then(
                    ({ default: page }) => {
                        if (page.layout === undefined) {
                            page.layout = DefaultLayout;
                        }
                        return page;
                    }
                );
            }
            return import(`./Pages/${name}`).then(({ default: page }) => {
                if (page.layout === undefined) {
                    page.layout = DefaultLayout;
                }
                return page;
            });
        }}
    />,
    app
);
