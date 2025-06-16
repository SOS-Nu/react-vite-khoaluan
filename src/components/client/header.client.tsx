import { useState, useEffect } from "react";
import {
  CodeOutlined,
  ContactsOutlined,
  FireOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  RiseOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from "antd";
import { Menu, ConfigProvider } from "antd";
import styles from "@/styles/client.module.scss";
import { isMobile } from "react-device-detect";
import { FaReact } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callLogout } from "@/config/api";
import { setLogoutAction } from "@/redux/slice/accountSlide";
import ManageAccount from "./modal/manage.account";
import { useCurrentApp } from "../context/app.context";
import { useTranslation } from "react-i18next";
import viFlag from "assets/svg/language/vi.svg";
import enFlag from "assets/svg/language/en.svg";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link as BootstrapLink, NavLink } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { MdOutlineLightMode, MdNightlight } from "react-icons/md";

type ThemeContextType = "light" | "dark";

const Header = (props: any) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [current, setCurrent] = useState("home");
  const location = useLocation();

  const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const items: MenuProps["items"] = [
    {
      label: <Link to={"/"}>Trang Chủ</Link>,
      key: "/",
      icon: <TwitterOutlined />,
    },
    {
      label: <Link to={"/job"}>Việc Làm IT</Link>,
      key: "/job",
      icon: <CodeOutlined />,
    },
    {
      label: <Link to={"/company"}>Top Công ty IT</Link>,
      key: "/company",
      icon: <RiseOutlined />,
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const itemsDropdown = [
    {
      label: (
        <label
          style={{ cursor: "pointer" }}
          onClick={() => setOpenManageAccount(true)}
        >
          Quản lý tài khoản
        </label>
      ),
      key: "manage-account",
      icon: <ContactsOutlined />,
    },
    ...(user.role?.permissions?.length
      ? [
          {
            label: <Link to={"/admin"}>Trang Quản Trị</Link>,
            key: "admin",
            icon: <FireOutlined />,
          },
        ]
      : []),

    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  const itemsMobiles = [...items, ...itemsDropdown];

  //addpotfolio
  const { theme, setTheme } = useCurrentApp();
  const { t, i18n } = useTranslation();

  const handleMode = (mode: ThemeContextType) => {
    localStorage.setItem("theme", mode);
    document.documentElement.setAttribute("data-bs-theme", mode);
    setTheme(mode);
  };

  const renderFlag = (language: string) => {
    return (
      <img
        style={{ height: 20, width: 20 }}
        src={language === "en" ? enFlag : viFlag}
        alt={language}
      />
    );
  };

  return (
    <>
      {/* <div className={styles["header-section"]}>
        <div className={styles["container"]}>
          {!isMobile ? (
            <div style={{ display: "flex", gap: 30 }}>
              <div className={styles["brand"]}>
                <FaReact onClick={() => navigate("/")} title="Hỏi Dân IT" />
              </div>
              <div className={styles["top-menu"]}>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: "#fff",
                      colorBgContainer: "#222831",
                      colorText: "#a7a7a7",
                    },
                  }}
                >
                  <Menu
                    // onClick={onClick}
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={items}
                  />
                </ConfigProvider>
                <div className={styles["extra"]}>
                  {isAuthenticated === false ? (
                    <>
                      <Link to={"/login"}>Đăng Nhập</Link>
                    </>
                  ) : (
                    <Dropdown
                      menu={{ items: itemsDropdown }}
                      trigger={["click"]}
                    >
                      <Space style={{ cursor: "pointer" }}>
                        <span>Welcome {user?.name}</span>
                        <Avatar>
                          {" "}
                          {user?.name?.substring(0, 2)?.toUpperCase()}{" "}
                        </Avatar>
                      </Space>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["header-mobile"]}>
              <span>Your APP</span>
              <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
            </div>
          )}
        </div>
      </div>
      <Drawer
        title="Chức năng"
        placement="right"
        onClose={() => setOpenMobileMenu(false)}
        open={openMobileMenu}
      >
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="vertical"
          items={itemsMobiles}
        />
      </Drawer>
      <ManageAccount open={openMangeAccount} onClose={setOpenManageAccount} /> */}
      <Navbar
        fixed="top"
        data-bs-theme={theme}
        expand="lg"
        className="bg-body-tertiary"
        style={{ zIndex: 1 }}
      >
        <Container>
          <Link className="navbar-brand" to="/">
            <span className="brand-green">{t("appHeader.brand")}</span>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavLink className="nav-link" to="/">
                {t("appHeader.home")}
              </NavLink>
              <NavLink className="nav-link" to="/project">
                {" "}
                {t("appHeader.project")}
              </NavLink>
              <NavLink className="nav-link" to="/about">
                {t("appHeader.about")}
              </NavLink>
            </Nav>
            <Nav className="ms-auto">
              <div className="nav-link" style={{ cursor: "pointer" }}>
                {theme === "light" ? (
                  <MdOutlineLightMode
                    onClick={() => handleMode("dark")}
                    style={{ fontSize: 20 }}
                  />
                ) : (
                  <MdNightlight
                    onClick={() => handleMode("light")}
                    style={{ fontSize: 20 }}
                  />
                )}
              </div>

              <NavDropdown title={renderFlag(i18n.resolvedLanguage!)}>
                <div
                  onClick={() => i18n.changeLanguage("en")}
                  className="dropdown-item d-flex gap-2 align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    style={{ height: 20, width: 20 }}
                    src={enFlag}
                    alt="english"
                  />
                  <span>English</span>
                </div>
                <div
                  onClick={() => i18n.changeLanguage("vi")}
                  className="dropdown-item d-flex gap-2 align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    style={{ height: 20, width: 20 }}
                    src={viFlag}
                    alt="vietnamese"
                  />
                  <span>Tiếng Việt</span>
                </div>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
