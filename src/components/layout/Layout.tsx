import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import DynamicHead from "../DynamicHead";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
