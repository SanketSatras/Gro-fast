import { AuthForm } from "@/components/auth/AuthForm";

const DeliveryAuth = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
            <AuthForm role="delivery" title="Delivery Partner Portal" />
        </div>
    );
};

export default DeliveryAuth;
