/*!

=========================================================
* Argon Dashboard React - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { Row, Col } from "reactstrap";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <Row className="align-items-center justify-content-xl-between mx-2">
                <Col xl="6">
                    <div className="copyright text-center text-xl-left text-muted">
                        © {new Date().getFullYear()}{" "}
                        <a
                            className="font-weight-bold ml-1"
                            href="#"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Salvatore Alaimo, Ph.D.
                        </a>{" "}
                        - University of Catania, Italy
                    </div>
                </Col>

                <Col xl="6">
                    <div className="copyright text-center text-xl-right text-muted">
                        Theme provided by
                        <a
                            href="https://www.creative-tim.com"
                            className="font-weight-bold ml-1"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Creative Tim
                        </a>{" "}
                        under the{" "}
                        <a
                            href="https://github.com/creativetimofficial/argon-dashboard/blob/master/LICENSE.md"
                            target="_blank"
                            rel="noreferrer"
                        >
                            MIT License
                        </a>
                    </div>
                </Col>
            </Row>
        </footer>
    );
};

export default Footer;
