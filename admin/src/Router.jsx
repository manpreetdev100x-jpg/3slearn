import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import Wrap from "./Wrap";
import CreateStudent from "./components/StudentCreate";
import SearchStudent from "./components/ShowStudent";
import UpdateStudent from "./components/StudentUpdate";
import StudentPaymentPanel from "./components/payment";
import ExcelExportPanel from "./components/Excel";


const Router = createBrowserRouter([
  {
    path: "/",
    element: <Wrap/>,
    children :[
        {
            path:"/studentCreate",
            element:<CreateStudent/>
        },
        {
          path: "/studentProfile",
          element: <SearchStudent/>
        },
        {
          path:"/updateStudent",
          element:<UpdateStudent/>
        },
        {
          path:"/StudentPaymentPanel",
          element: <StudentPaymentPanel/>
        },
        {
          path : "/ExcelExportPanel",
          element : <ExcelExportPanel/>
        }
    ]
  },
]);



export default Router
