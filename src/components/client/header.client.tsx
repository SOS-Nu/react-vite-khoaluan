import { useState, useEffect } from "react";
import { FaReact, FaStar, FaChevronDown } from "react-icons/fa"; // Thêm FaStar cho icon động
import { MdOutlineLightMode, MdNightlight } from "react-icons/md";
import { useLocation, useNavigate, Link, NavLink } from "react-router-dom";
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
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { message } from "antd";
import logojobhunter from "assets/logojobhunter.png";
import "styles/stylespotfolio/global.scss";
import levannguyen from "assets/levannguyen.jpg";

// Define props type
interface HeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

// Define theme type
type ThemeContextType = "light" | "dark";

// Define types for nav items and dropdown items
interface NavItem {
  label: string | React.ReactNode;
  key: string;
  to?: string; // to có thể undefined nếu là dropdown
  isFeatured?: boolean; // Thêm thuộc tính để đánh dấu nút nổi bật
  dropdownItems?: DropdownItem[]; // Thêm dropdownItems cho mục có dropdown
  isNew?: boolean; // <-- THÊM DÒNG NÀY
}

interface DropdownItem {
  label: string | any;
  key: string;
  to?: string;
  onClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useCurrentApp();
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
  const [openManageAccount, setOpenManageAccount] = useState<boolean>(false);
  const [current, setCurrent] = useState<string>("home");
  const location = useLocation();

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const handleMode = (mode: ThemeContextType) => {
    localStorage.setItem("theme", mode);
    document.documentElement.setAttribute("data-bs-theme", mode);
    setTheme(mode);
  };
  // Hàm cuộn về đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Điều hướng đến trang job với searchTerm
    navigate(`/job?search=${encodeURIComponent(searchTerm)}`);
  };

  const renderFlag = (language: string) => (
    <img
      style={{ height: 20, width: 20 }}
      src={language === "en" ? enFlag : viFlag}
      alt={language}
    />
  );

  const navItems: NavItem[] = [
    { label: t("appHeader.home"), key: "/", to: "/" },
    { label: "Tìm Việc Làm", key: "/job", to: "/job", isNew: true },
    { label: "Tìm Công ty", key: "/company", to: "/company" },
    { label: "Tạo CV Bởi AI", key: "/company", to: "/CVAI", isNew: true },
    {
      label: (
        <span>
          Profile CV <FaChevronDown style={{ marginLeft: 5, fontSize: 12 }} />
        </span>
      ),
      key: "/profile-cv",
      dropdownItems: [
        { label: "Online Resume", key: "/resume/create", to: "/resume/create" },
        { label: "Create CV", key: "create-cv" },
        { label: "Evaluation CV By AI", key: "evaluation-cv" },
        { label: "AI Roadmap", key: "ai-roadmap" },
      ],
    },
  ];

  const dropdownItems: DropdownItem[] = [
    ...(user?.role?.permissions?.length
      ? [
          {
            label: "Trang Cá Nhân CV",
            key: "pagecv",
            to: `/user/online-resumes/${user.id}`,
          },
        ]
      : []),
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
      onClick: () => setOpenManageAccount(true),
    },
    ...(user?.role?.permissions?.length
      ? [{ label: "Trang Quản Trị", key: "admin", to: "/admin" }]
      : []),
    {
      label: <label style={{ cursor: "pointer" }}>Tin Nhắn</label>,
      key: "chat",
      to: "/chat/detail",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </label>
      ),
      key: "logout",
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <div className="header-section">
        <Navbar
          fixed="top"
          data-bs-theme={theme}
          expand="lg"
          className="bg-body-tertiary"
        >
          <Container>
            <Link className="navbar-brand brand" to="/">
              <img
                src={logojobhunter}
                alt="Logo Job Hunter"
                className="react-icon"
                title="SOS Nu"
              />
              &nbsp; &nbsp;
              <h3 style={{ paddingTop: 5, paddingBottom: 5 }}>
                <strong className="brand-red">{t("appHeader.brand")} </strong>
                <span className="wave" role="img" aria-labelledby="wave">
                  👋🏻
                </span>
              </h3>
            </Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto">
                {navItems.map((item) =>
                  item.dropdownItems ? (
                    <NavDropdown
                      key={item.key}
                      title={item.label}
                      id={`nav-dropdown-${item.key}`}
                      className={`${current === item.key ? "active" : ""} ${
                        item.key === "/profile-cv" ? "profile-cv-dropdown" : ""
                      }`} // Thêm class cho Profile CV
                    >
                      {item.dropdownItems.map((dropdownItem) =>
                        dropdownItem.to ? (
                          <NavDropdown.Item
                            key={dropdownItem.key}
                            as={Link}
                            to={dropdownItem.to}
                          >
                            {dropdownItem.label}
                          </NavDropdown.Item>
                        ) : (
                          <NavDropdown.Item
                            key={dropdownItem.key}
                            onClick={dropdownItem.onClick}
                          >
                            {dropdownItem.label}
                          </NavDropdown.Item>
                        )
                      )}
                    </NavDropdown>
                  ) : (
                    <NavLink
                      key={item.key}
                      to={item.to!}
                      className={({ isActive }) =>
                        // Thêm class 'position-relative' để định vị cho nhãn "NEW"
                        `nav-link position-relative ${isActive && current === item.key ? "active" : ""}`
                      }
                      onClick={
                        () => {
                          setCurrent(item.key);
                          scrollToTop();
                        } // Cuộn về đầu trang
                      }
                    >
                      {item.label}
                      {/* THÊM KHỐI LỆNH NÀY */}
                      {item.isNew && <span className="new-badge">AI</span>}
                      {/* KẾT THÚC KHỐI LỆNH THÊM */}
                    </NavLink>
                  )
                )}
              </Nav>
              {/* <Form className="d-flex mx-3" onSubmit={handleSearch}>
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm việc làm"
                  className="me-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-primary" type="submit">
                  Tìm
                </Button>
              </Form> */}
              <Nav className="ms-auto align-items-center">
                {isAuthenticated ? (
                  <NavDropdown
                    title={
                      <span>
                        {user?.name}{" "}
                        {/* <span className="avatar" style={{ marginLeft: 8 }}>
                          {user?.name?.substring(0, 2)?.toUpperCase()}
                        </span> */}
                        {/* avatar user */}
                        <img
                          src={levannguyen}
                          alt="user avatar"
                          className="avatar"
                        />
                      </span>
                    }
                    id="user-dropdown"
                    className="user-dropdown-custom" // Thêm class
                  >
                    {dropdownItems.map((item) =>
                      item.to ? (
                        <NavDropdown.Item key={item.key} as={Link} to={item.to}>
                          {item.label}
                        </NavDropdown.Item>
                      ) : (
                        <NavDropdown.Item key={item.key} onClick={item.onClick}>
                          {item.label}
                        </NavDropdown.Item>
                      )
                    )}
                  </NavDropdown>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login?callback=/recruiter">
                      Nhà Tuyển Dụng
                    </Nav.Link>
                    <Nav.Link as={Link} to="/login">
                      Đăng Nhập
                    </Nav.Link>
                  </>
                )}
                <Nav.Link
                  onClick={() =>
                    handleMode(theme === "light" ? "dark" : "light")
                  }
                >
                  {theme === "light" ? (
                    <MdOutlineLightMode style={{ fontSize: 20 }} />
                  ) : (
                    <MdNightlight style={{ fontSize: 20 }} />
                  )}
                </Nav.Link>
                <NavDropdown
                  className="nav-item-dropdown"
                  title={renderFlag(i18n.resolvedLanguage ?? "en")}
                  id="language-dropdown"
                >
                  <NavDropdown.Item
                    onClick={() => i18n.changeLanguage("en")}
                    className="d-flex gap-2 align-items-center"
                  >
                    <img
                      style={{ height: 20, width: 20 }}
                      src={enFlag}
                      alt="english"
                    />
                    English
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={() => i18n.changeLanguage("vi")}
                    className="d-flex gap-2 align-items-center"
                  >
                    <img
                      style={{ height: 20, width: 20 }}
                      src={viFlag}
                      alt="vietnamese"
                    />
                    Tiếng Việt
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        data-bs-theme={theme}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chức năng</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navItems.map((item) =>
              item.dropdownItems ? (
                <NavDropdown
                  key={item.key}
                  title={item.label}
                  id={`offcanvas-dropdown-${item.key}`}
                  className={current === item.key ? "active" : ""}
                >
                  {item.dropdownItems.map((dropdownItem) => (
                    <NavDropdown.Item
                      key={dropdownItem.key}
                      onClick={() => {
                        dropdownItem.onClick?.();
                        setShowOffcanvas(false);
                      }}
                    >
                      {dropdownItem.label}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              ) : (
                <NavLink
                  key={item.key}
                  to={item.to!}
                  className={({ isActive }) =>
                    `nav-link ${isActive && current === item.key ? "active" : ""}`
                  }
                  onClick={() => {
                    setCurrent(item.key);
                    setShowOffcanvas(false);
                  }}
                >
                  {item.label}
                </NavLink>
              )
            )}
            {isAuthenticated ? (
              <>
                {dropdownItems.map((item) =>
                  item.to ? (
                    <Nav.Link
                      key={item.key}
                      as={Link}
                      to={item.to}
                      onClick={() => setShowOffcanvas(false)}
                    >
                      {item.label}
                    </Nav.Link>
                  ) : (
                    <Nav.Link
                      key={item.key}
                      onClick={() => {
                        item.onClick?.();
                        setShowOffcanvas(false);
                      }}
                    >
                      {item.label}
                    </Nav.Link>
                  )
                )}
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  onClick={() => setShowOffcanvas(false)}
                >
                  Đăng Nhập
                </Nav.Link>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <ManageAccount
        open={openManageAccount}
        onClose={() => setOpenManageAccount(false)}
      />
    </>
  );
};

export default Header;
