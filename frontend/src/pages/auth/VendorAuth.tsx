import { AuthForm } from "@/components/auth/AuthForm";

const VendorAuth = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
            <AuthForm role="vendor" title="Vendor Management" />
        </div>
    );
};

export default VendorAuth;
