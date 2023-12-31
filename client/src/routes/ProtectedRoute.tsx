import { Navigate } from "react-router-dom";

/** Hooks */
import { useSession } from "~/providers/Auth";

type ProtectedRouteProps = {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { session } = useSession();
    return session?.token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
