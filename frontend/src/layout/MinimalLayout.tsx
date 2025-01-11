import { Outlet } from "react-router-dom";

const MinimalLayout = () => {
  return (
    <div>
      <Outlet /> {/* Render children routes */}
    </div>
  );
};

export default MinimalLayout;
