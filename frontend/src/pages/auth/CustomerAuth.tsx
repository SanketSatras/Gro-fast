import { AuthForm } from "@/components/auth/AuthForm";

const CustomerAuth = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <AuthForm role="customer" title="Customer Portal" />
        </div>
    );
};

export default CustomerAuth;
