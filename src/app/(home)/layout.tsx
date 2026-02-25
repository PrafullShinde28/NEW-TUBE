import {HomeLayout} from "@/modules/home/ui/layout/home-layout"
export const dynamic = "force-dynamic";

interface LayoutProp {
    children : React.ReactNode;
};

const Layout = ({children}:LayoutProp) => {
   return(
      <HomeLayout>
        {children}
      </HomeLayout>
   )
}

export default Layout


