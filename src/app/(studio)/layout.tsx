import {StudioLayout} from "@/modules/studio/ui/layout/studio-layout"

interface LayoutProp {
    children : React.ReactNode;
};

const Layout = ({children}:LayoutProp) => {
   return(
      <StudioLayout>
        {children}
      </StudioLayout>
   )
}

export default Layout


