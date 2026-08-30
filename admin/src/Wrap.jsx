import { Outlet } from "react-router";
import LeftNav from "./LeftNav";
export default function Wrap(){
    return (
       <div className="flex w-full h-full overflow-hidden">
       <div className="w-[20%]">
         <LeftNav/>
       </div>
        <Outlet/>
       </div>
    )
}