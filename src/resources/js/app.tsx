import React from "react";
import { render } from "react-dom";
import { InertiaApp } from "@inertiajs/inertia-react";
import { InertiaProgress } from "@inertiajs/progress";
import "./Common/axios";

InertiaProgress.init();

const app = document.getElementById("app");

import "../css/nucleo/css/nucleo.css";
import Dashboard from "./Components/Layout/Dashboard";

const DefaultLayout = (page: React.ReactNode) => <Dashboard>{page}</Dashboard>;

render(
    <InertiaApp
        initialPage={app ? JSON.parse(app.dataset.page ?? "") : "{}"}
        resolveComponent={(name) =>
            import(`./Pages/${name}`).then(({ default: page }) => {
                if (page.layout === undefined) {
                    page.layout = DefaultLayout;
                }
                return page;
            })
        }
    />,
    app
);
