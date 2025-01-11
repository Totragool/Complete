import { lazy } from "react";

import { RouteObject } from "react-router-dom";

import Loadable from "../components/third-party/Loadable";

import AdminLayout from "../layout/AdminLayout";


const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));

const HomeCode = Loadable(lazy(() => import("../pages/admin/palm")));

const Code = Loadable(lazy(() => import("../pages/admin/palm/code")));

const CreateCode = Loadable(lazy(() => import("../pages/admin/palm/code/create")));

const EditCode = Loadable(lazy(() => import("../pages/admin/palm/code/edit")));

const AddAdmin = Loadable(lazy(() => import("../pages/admin/palm/add")));

const AdminCreate = Loadable(lazy(() => import("../pages/admin/palm/add/create")));

const AdminEdit = Loadable(lazy(() => import("../pages/admin/palm/add/edit")));




const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
    return {
      path: "/",
      element: isLoggedIn ? <AdminLayout /> : <MainPages />,
      children: [
        {
          path: "/home",
          element: <HomeCode />,
        },
        {
          path: "/code",
          children: [
            {
              path: "/code",
              element: <Code />,
            },
            {
              path: "/code/create",
              element: <CreateCode />,
            },
            {
              path: "/code/edit/:id",
              element: <EditCode />,
            },
          ],
        },
        {
            path: "/add",
            children: [
              {
                path: "/add",
                element: <AddAdmin />,
              },
              {
                path: "/add/create",
                element: <AdminCreate />,
              },
              {
                path: "/add/edit/:id",
                element: <AdminEdit />,
              },
            ],
          },
      ],
    };
  };
  


export default AdminRoutes;