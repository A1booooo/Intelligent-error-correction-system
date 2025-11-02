import { useNavigate, Outlet } from "react-router-dom";

function MainLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h1>Main Layout</h1>
      <button onClick={() => navigate("/home")}>进入首页</button>
      <Outlet />
    </div>
  );
}

export default MainLayout;
