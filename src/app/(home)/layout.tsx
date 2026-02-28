import {HomeLayout} from "@/modules/home/ui/layout/home-layout"

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


