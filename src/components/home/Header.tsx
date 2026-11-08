"use client";

/* Mã nguồn giữ theo GlobalHeader.js của bản src; CSS nằm ở GlobalHeader.css (cùng tên class). */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { settingsApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import "./GlobalHeader.css";

/* ---------- Kiểu & tiện ích ---------- */
type Link = { text: string; href: string };
type Column = { title: string; path: string; links: Link[] };
type MenuNode = { path: string; columns: Column[] };
type NavItem = { id?: string; title: string; path?: string; order?: number; isVisible?: boolean; children?: any[] };

const titleToSlug = (title: string) =>
  title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

/* Đường dẫn trong project Next: danh mục thiệp đều dẫn về /templates, cửa hàng và tin tức đổi sang route thật */
const TEMPLATES = "/templates";
const SHOP = "/shop";
const BLOG = "/blog";

const UserMenu = ({ name, email, initial, onLogout }: { name: string; email: string; initial: string; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const go = (path: string) => { router.push(path); setIsOpen(false); };
  const logout = () => { onLogout(); setIsOpen(false); router.push("/"); };

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="avatar-button" onClick={() => setIsOpen(!isOpen)}>
        <img src={`https://placehold.co/40x40/CDD7E5/333?text=${encodeURIComponent(initial)}`} alt="User Avatar" />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="username">{name}</p>
            <p className="email">{email}</p>
          </div>
          <button className="dropdown-item" onClick={() => go("/account-settings")}>Cài đặt tài khoản</button>
          <button className="dropdown-item" onClick={() => go("/invitation-management")}>Quản lí thiệp mời</button>
          <button className="dropdown-item" onClick={logout}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
};

const MegaMenuPane = ({ activeMenuData, onMouseEnter, onMouseLeave }: { activeMenuData: MenuNode | null; onMouseEnter: () => void; onMouseLeave: () => void }) => {
  const router = useRouter();
  const isVisible = !!activeMenuData && activeMenuData.columns?.length > 0;
  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    router.push(path);
    onMouseLeave();
  };
  return (
    <div className={`mega-menu-pane ${isVisible ? "visible" : ""}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="container">
        {isVisible && (
          <div className="mega-menu-content">
            {activeMenuData!.columns.map((column, index) => (
              <div key={index} className="mega-menu-column">
                <a href={column.path} onClick={(e) => handleLinkClick(e, column.path)} className="mega-menu-title-link">
                  <h3 className="mega-menu-title">{column.title}</h3>
                </a>
                <ul className="mega-menu-links">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileNav = ({ isOpen, onMenuToggle, menuData, mainNavItems }: { isOpen: boolean; onMenuToggle: () => void; menuData: Record<string, MenuNode>; mainNavItems: NavItem[] }) => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const router = useRouter();
  if (!isOpen) return null;

  const handleItemClick = (item: NavItem) => {
    const node = menuData[item.title];
    if (node?.columns?.length) setOpenSubMenu((prev) => (prev === item.title ? null : item.title));
    else {
      router.push(node?.path || "#");
      onMenuToggle();
    }
  };
  const handleSubItemClick = (path: string) => {
    router.push(path);
    onMenuToggle();
  };

  return (
    <div className={`mobile-nav-container ${isOpen ? "open" : ""}`} onClick={onMenuToggle}>
      <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-nav-header">
          <button onClick={onMenuToggle} className="mobile-nav-close-btn">
            <AiOutlineClose size={24} />
          </button>
        </div>
        <div className="mobile-nav-scroll-area">
          {mainNavItems.map((item) => {
            const node = menuData[item.title];
            const hasSubMenu = !!node?.columns?.length;
            const isSubMenuOpen = openSubMenu === item.title;
            return (
              <div key={item.id || item.title} className="mobile-nav-group">
                <button className="mobile-nav-item" onClick={() => handleItemClick(item)}>
                  <span>{item.title}</span>
                  {hasSubMenu && <AiOutlineRight className={`arrow-icon ${isSubMenuOpen ? "open" : ""}`} />}
                </button>
                {hasSubMenu && isSubMenuOpen && (
                  <div className="mobile-submenu">
                    {node.columns.map((col) => (
                      <div key={col.title} className="mobile-submenu-column">
                        <button className="mobile-submenu-title" onClick={() => handleSubItemClick(col.path)}>{col.title}</button>
                        {col.links.map((link) => (
                          <button key={link.text} className="mobile-submenu-item" onClick={() => handleSubItemClick(link.href)}>{link.text}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type Announcement = { isEnabled?: boolean; text?: string; link?: string; backgroundColor?: string; textColor?: string; backgroundImage?: string; isMarquee?: boolean };

const AnnouncementBar = ({ bar }: { bar?: Announcement }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("announcementDismissed")) setIsVisible(true);
  }, []);
  if (!isVisible || !bar?.isEnabled || !bar.text) return null;

  const { text, link, backgroundColor, textColor, backgroundImage, isMarquee } = bar;
  const barStyle: React.CSSProperties = { color: textColor || "var(--color-text-white)", position: "relative", overflow: "hidden" };
  if (backgroundImage) barStyle.backgroundImage = `url(${backgroundImage})`;
  else if (backgroundColor) barStyle.backgroundColor = backgroundColor;

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem("announcementDismissed", "true");
  };

  const content = (
    <div className="announcement-bar" style={barStyle}>
      {backgroundImage && <div className="announcement-bar-overlay"></div>}
      <div className={`announcement-bar-content ${isMarquee ? "marquee" : ""}`}>
        <p>
          {text} {link && <a href={link} className="learn-more-link">Tìm hiểu thêm.</a>}
        </p>
      </div>
      <button onClick={handleClose} className="announcement-close-btn" aria-label="Đóng thông báo">&times;</button>
    </div>
  );
  return link ? <a href={link} className="announcement-bar-link">{content}</a> : content;
};

/* ---------- Thanh chính ---------- */
const MainHeader = ({
  onMenuToggle, isSticky, isVisible, activeMenu, setActiveMenu, menuData, mainNavItems, companyName, logoUrl, headerRef,
}: {
  onMenuToggle: () => void; isSticky: boolean; isVisible: boolean; activeMenu: string | null;
  setActiveMenu: (v: string | null) => void; menuData: Record<string, MenuNode>; mainNavItems: NavItem[];
  companyName: string; logoUrl?: string; headerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavigate = (path: string) => {
    router.push(path);
    setActiveMenu(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${SHOP}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleMouseEnter = (title: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(title);
  };
  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  return (
    <div ref={headerRef} className={`main-header-wrapper ${isSticky ? "is-sticky" : ""} ${isVisible ? "" : "is-hidden"}`}>
      <div className="main-header">
        <div className="container">
          <div className="header-top">
            <div className="header-section left">
              <div className="logo" onClick={() => handleNavigate("/")}>
                {logoUrl ? <img src={logoUrl} alt={companyName} /> : companyName}
              </div>
              <nav className="header-nav-main desktop-only">
                <button className="nav-item" onClick={() => handleNavigate("/professional")}>Chuyên nghiệp</button>
              </nav>
            </div>
            <div className="header-section right">
              <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm sản phẩm, mẫu thiệp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              {isAuthenticated && user ? (
                <UserMenu name={user.name} email={user.email} initial={(user.name || "A").charAt(0).toUpperCase()} onLogout={logout} />
              ) : (
                <div className="auth-actions">
                  <button className="auth-btn" onClick={() => handleNavigate("/sign-in")}>Đăng nhập</button>
                  <span className="separator"></span>
                  <button className="auth-btn" onClick={() => handleNavigate("/sign-up")}>Đăng ký</button>
                </div>
              )}
            </div>
            <button className="hamburger-menu mobile-only" onClick={onMenuToggle} aria-label="Mở menu">
              <HiOutlineMenuAlt3 size={28} />
            </button>
          </div>
          <nav className="header-bottom desktop-only">
            {mainNavItems.map((item) => (
              <button
                key={item.id || item.title}
                onClick={() => handleNavigate(menuData[item.title]?.path || item.path || "#")}
                onMouseEnter={() => handleMouseEnter(item.title)}
                onMouseLeave={handleMouseLeave}
                className={`nav-item-bottom ${activeMenu === item.title ? "active" : ""}`}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </div>
        <MegaMenuPane
          activeMenuData={activeMenu ? menuData[activeMenu] ?? null : null}
          onMouseEnter={() => menuTimeoutRef.current && clearTimeout(menuTimeoutRef.current)}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
};

/* ---------- Header ---------- */
export function Header({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const mainHeaderRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    settingsApi
      .getPublicSettings()
      .then((res) => setSettings(res.data?.data ?? res.data ?? null))
      .catch(() => setSettings(null));
  }, []);

  /* Menu lấy từ settings.headerNav, cùng logic với bản src */
  const { mainNavItems, menuData } = useMemo(() => {
    const navSrc: NavItem[] = settings?.headerNav ?? [];
    const visible = navSrc.filter((i) => i.isVisible).sort((a, b) => (a.order || 0) - (b.order || 0));
    const data: Record<string, MenuNode> = {};
    const mainCategories = visible.slice(0, 3);
    const otherCategories = visible.slice(3);
    const items: NavItem[] = [...mainCategories];

    mainCategories.forEach((nav) => {
      data[nav.title] = {
        path: TEMPLATES,
        columns: (nav.children || [])
          .filter((c) => c.isVisible)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((col) => ({
            title: col.title,
            path: TEMPLATES,
            links: (col.children || [])
              .filter((l: any) => l.isVisible)
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((l: any) => ({ text: l.title, href: TEMPLATES })),
          })),
      };
    });

    if (otherCategories.length) {
      items.push({ id: "other-invitations", title: "Thiệp khác", path: TEMPLATES, order: 97 });
      data["Thiệp khác"] = {
        path: TEMPLATES,
        columns: otherCategories.map((nav) => ({
          title: nav.title,
          path: TEMPLATES,
          links: (nav.children || []).filter((l: any) => l.isVisible).map((l: any) => ({ text: l.title, href: TEMPLATES })),
        })),
      };
    }

    /* Gộp Cửa hàng và Dịch vụ thành một mục */
    if (!items.some((i) => i.title === "Cửa hàng - Dịch vụ")) {
      items.push({ id: "static-shop", title: "Cửa hàng - Dịch vụ", path: SHOP, order: 98, isVisible: true });
      data["Cửa hàng - Dịch vụ"] = {
        path: SHOP,
        columns: [
          {
            title: "Sản phẩm & Dịch vụ",
            path: SHOP,
            links: [
              { text: "In ấn", href: `${SHOP}?category=print` },
              { text: "Tại sự kiện", href: `${SHOP}?category=onsite` },
              { text: "Kỹ thuật số", href: `${SHOP}?category=digital` },
              { text: "Dịch vụ", href: `${SHOP}#dich-vu` },
            ],
          },
        ],
      };
    }

    if (!items.some((i) => i.title === "Tin tức")) {
      items.push({ id: "static-blogs", title: "Tin tức", path: BLOG, order: 99, isVisible: true });
      data["Tin tức"] = { path: BLOG, columns: [] };
    }

    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return { mainNavItems: items, menuData: data };
  }, [settings]);

  useEffect(() => {
    if (mainHeaderRef.current) setHeaderHeight(mainHeaderRef.current.offsetHeight);
    const handleScroll = () => {
      const y = window.scrollY;
      if (mainHeaderRef.current) setIsSticky(y > mainHeaderRef.current.offsetHeight);
      setIsHeaderVisible(y < lastScrollY.current || y < 100);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return (
    <header className={`header-container ${className || ""}`}>
      {isSticky && <div style={{ height: `${headerHeight}px` }} />}
      <AnnouncementBar bar={settings?.theme?.announcementBar} />
      <MainHeader
        headerRef={mainHeaderRef}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isSticky={isSticky}
        isVisible={isHeaderVisible}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        menuData={menuData}
        mainNavItems={mainNavItems}
        companyName={settings?.theme?.companyName || "iCards.com.vn"}
        logoUrl={settings?.theme?.logoUrl}
      />
      <MobileNav isOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(false)} menuData={menuData} mainNavItems={mainNavItems} />
    </header>
  );
}
