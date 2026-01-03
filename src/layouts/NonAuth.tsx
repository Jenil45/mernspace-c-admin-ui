import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store";

const NonAuth = () => {
  // protected route logic
  const { user } = useAuthStore();

  if (user !== null) {
    return <Navigate to={"/"} replace={true} />;
  }

  return (
    <div>
      <h1>NoAuth Component</h1>
      <Outlet />
    </div>
  );
};

export default NonAuth;
