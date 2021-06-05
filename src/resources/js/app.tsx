import React from "react";
import { render } from "react-dom";
import { InertiaApp } from "@inertiajs/inertia-react";
import { InertiaProgress } from "@inertiajs/progress";
import "./Common/axios";

InertiaProgress.init();

const app = document.getElementById("app");

import "../css/nucleo/css/nucleo.css";
import Dashboard from "./Components/Layout/Dashboard";
import { pluginRegex } from "./Common/pluginResolver";

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
