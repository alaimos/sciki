import React, { useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col,
    FormFeedback,
} from "reactstrap";
import Auth from "../../Components/Layout/Auth";
import { useNavbarContext } from "../../Contexts/NavbarProvider";
import { InertiaLink, useForm } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import classNames from "classnames";

const Login: React.FC = () => {
    const { setTitle: setPageTitle } = useNavbarContext();
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: "",
    });

    useEffect(() => {
        setPageTitle("Log In");
    });

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await post(route("login"));
    };

    return (
        <>
            <Col lg="5" md="7">
                <Card className="bg-secondary shadow border-0">
                    <CardBody className="px-lg-5 py-lg-5">
                        <Form role="form" onSubmit={submitHandler}>
                            <FormGroup
                                className={classNames("mb-3", {
                                    "has-danger": !!errors.email,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        autoComplete="login-email"
                                        value={data.email}
                                        invalid={!!errors.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>{errors.email}</strong>
                                </FormFeedback>
                            </FormGroup>
                            <FormGroup
                                className={classNames("mb-3", {
                                    "has-danger": !!errors.password,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        autoComplete="login-password"
                                        value={data.password}
                                        invalid={!!errors.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>{errors.password}</strong>
                                </FormFeedback>
                            </FormGroup>
                            <div className="custom-control custom-control-alternative custom-checkbox">
                                <input
                                    className="custom-control-input"
                                    id="customCheckLogin"
                                    type="checkbox"
                                    value={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.value)
                                    }
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="customCheckLogin"
                                >
                                    <span className="text-muted">
                                        Remember me
                                    </span>
                                </label>
                            </div>
                            <div className="text-center">
                                <Button
                                    className="my-4"
                                    color="primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
                <Row className="mt-3">
                    <Col xs="6">
                        <InertiaLink
                            className="text-light"
                            href={route("password.request")}
                        >
                            <small>Forgot password?</small>
                        </InertiaLink>
                    </Col>
                    <Col className="text-right" xs="6">
                        <InertiaLink
                            className="text-light"
                            href={route("register")}
                        >
                            <small>Create new account</small>
                        </InertiaLink>
                    </Col>
                </Row>
            </Col>
        </>
    );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line react/display-name
Login.layout = (page: React.ReactNode) => <Auth>{page}</Auth>;

export default Login;
