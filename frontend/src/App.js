import { Outlet } from "react-router-dom";
import Layout from "./components/layout";

import { StateProvider } from "./context/use-context";

export default function App() {
  return (
    <StateProvider>
      <Layout>
        <Outlet />
      </Layout>
    </StateProvider>
  );
}
