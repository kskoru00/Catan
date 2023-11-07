import classes from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Catan</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
