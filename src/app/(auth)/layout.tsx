interface LayoutProp {
  children : React.ReactNode;
}
const Layout = ({children}:LayoutProp)=>{
  return (
    <div className="min-h-screen flex items-center justify-center">
        {children}
    </div>
  );
}

export default Layout;