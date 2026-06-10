import Sidebar from "../../pages/Dashboard/components/Sidebar";
import "../..//pages/Dashboard/Dashboard.css";

export default function MainLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="content">
        {children}
      </main>
    </div>
  );
}