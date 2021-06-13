import React from "react";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";
import classNames from "classnames";
import { InputType } from "reactstrap/es/Input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
    type: InputType;
    placeholder?: string;
    error?: string;
    value?: string;
    setValue?: (name: string, value: string) => void;
}

const InputWithLabel: React.FC<Props> = ({
    name,
    label,
    error,
    setValue,
    ...inputProps
}: Props) => {
    const id = `${name}-${Math.random().toString(36).substr(2, 10)}`;
    return (
        <FormGroup
            className={classNames({
                "has-danger": !!error,
            })}
        >
            <Label className="form-control-label" for={id}>
                {label}
            </Label>
            <Input
                id={id}
                name={name}
                invalid={!!error}
                onChange={(e) => setValue?.(name, e.target.value)}
                {...inputProps}
            />
            <FormFeedback
                tag="span"
                className="invalid-feedback"
                style={{
                    display: "block",
                }}
            >
                <strong>{error}</strong>
            </FormFeedback>
        </FormGroup>
    );
};

export default InputWithLabel;
