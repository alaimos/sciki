import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/inertia-react";
import { Page } from "@inertiajs/inertia";
import { CommonPageProps } from "../../../../Types/page";
import SweetAlert from "react-bootstrap-sweetalert";

// eslint-disable-next-line @typescript-eslint/ban-types
const FlashMessages: React.FC = () => {
    const [state, setState] = useState<{
        error?: boolean;
        success?: boolean;
        status?: boolean;
    }>({});
    const { flash } = usePage<Page<CommonPageProps>>().props;
    const onConfirm = () => setState({});

    useEffect(() => {
        if (flash.error) {
            setState({ error: true });
        } else if (flash.success) {
            setState({ success: true });
        } else if (flash.status) {
            setState({ status: true });
        }
    }, [flash.error, flash.success, flash.status]);

    return (
        <>
            {state.error && (
                <SweetAlert
                    error
                    title="Error!"
                    timeout={2000}
                    onConfirm={onConfirm}
                >
                    {flash.error}
                </SweetAlert>
            )}
            {state.success && (
                <SweetAlert
                    success
                    title="Success!"
                    timeout={2000}
                    onConfirm={onConfirm}
                >
                    {flash.success}
                </SweetAlert>
            )}
            {state.status && (
                <SweetAlert
                    info
                    title="Notice"
                    timeout={2000}
                    onConfirm={onConfirm}
                >
                    {flash.status}
                </SweetAlert>
            )}
        </>
    );
};

export default FlashMessages;
