import React from "react";
import Sidebar from "./Partials/Dashboard/Sidebar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "./Partials/Dashboard/Navbar";
import { Container } from "reactstrap";
import Footer from "./Partials/Dashboard/Footer";
import NavbarProvider from "../../Contexts/NavbarProvider";
import FlashMessages from "./Partials/Dashboard/FlashMessages";

// eslint-disable-next-line @typescript-eslint/ban-types
const Dashboard: React.FC = ({ children }: React.PropsWithChildren<{}>) => (
    <NavbarProvider>
        <Sidebar />
        <div className="main-content">
            <Navbar />
            {children}
            <FlashMessages />
            <Container fluid>
                <Footer />
            </Container>
        </div>
    </NavbarProvider>
);

export default Dashboard;
