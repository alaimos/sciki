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
import Auth from "../../../Components/Layout/Auth";
import { useNavbarContext } from "../../../Contexts/NavbarProvider";
import { InertiaLink, useForm } from "@inertiajs/inertia-react";
import route from "ziggy-js";
import classNames from "classnames";

interface Props {
    token: string;
    email: string;
}

const Login: React.FC<Props> = ({ token, email }: Props) => {
    const { setTitle: setPageTitle } = useNavbarContext();
    const { data, setData, post, processing, errors } = useForm({
        email,
        password: "",
        password_confirmation: "",
        token,
    });

    useEffect(() => {
        setPageTitle("Reset Password");
    });

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await post(route("password.update"));
    };

    return (
        <>
            <Col lg="5" md="7">
                <Card className="bg-secondary shadow border-0">
                    <CardBody className="px-lg-5 py-lg-5">
                        <Form role="form" onSubmit={submitHandler}>
                            <Input
                                type="hidden"
                                value={token}
                                onChange={(e) =>
                                    setData("token", e.target.value)
                                }
                            />
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
                                className={classNames({
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
                                        autoComplete="new-password"
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
                            <FormGroup
                                className={classNames({
                                    "has-danger":
                                        !!errors.password_confirmation,
                                })}
                            >
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open" />
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Confirm Password"
                                        type="password"
                                        autoComplete="new-password-confirmation"
                                        value={data.password_confirmation}
                                        invalid={!!errors.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                    />
                                </InputGroup>
                                <FormFeedback
                                    tag="span"
                                    className="invalid-feedback"
                                    style={{ display: "block" }}
                                >
                                    <strong>
                                        {errors.password_confirmation}
                                    </strong>
                                </FormFeedback>
                            </FormGroup>
                            <div className="text-center">
                                <Button
                                    className="my-4"
                                    color="primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Reset Password
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
                <Row className="mt-3">
                    <Col xs="6">
                        <InertiaLink
                            className="text-light"
                            href={route("login")}
                        >
                            <small>Back to Log In form</small>
                        </InertiaLink>
                    </Col>
                    <Col className="text-right" xs="6" />
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
