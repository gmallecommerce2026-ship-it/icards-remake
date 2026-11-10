"use client";

/* Mã nguồn giữ theo GlobalHeader.js của bản src; CSS nằm ở GlobalHeader.css (cùng tên class). */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronRight, Search } from "lucide-react";
import { settingsApi, templatesApi } from "@/lib/api";
import { FALLBACK_ROOTS, flattenTemplates, rootOf, type TreeNode } from "@/lib/templates-tree";
import { useAuth } from "@/providers/AuthProvider";
import "./GlobalHeader.css";

/* ---------- Kiểu & tiện ích ---------- */
type Link = { text: string; href: string };
type Column = { title: string; path: string; links: Link[] };
type MenuNode = { path: string; columns: Column[] };
type NavItem = { id?: string; title: string; path?: string; order?: number; isVisible?: boolean; children?: any[] };
/* Khóa menu theo id (không theo tiêu đề: hai mục có thể cùng tên, vd "Sự kiện" là danh mục thiệp và mục Sự kiện). */
const menuKey = (item: { id?: string; title: string }) => item.id || item.title;


/* Đường dẫn trong project Next: danh mục thiệp đều dẫn về /templates, cửa hàng và tin tức đổi sang route thật */
const TEMPLATES = "/templates";
const SHOP = "/shop";
/* Số link tối đa mỗi cột khi dựng menu từ cây mẫu thiệp (chỉ dùng khi chưa có menu admin) */
const MAX_LINKS = 4;

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
    const node = menuData[menuKey(item)];
    if (node?.columns?.length) setOpenSubMenu((prev) => (prev === menuKey(item) ? null : menuKey(item)));
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
            <X size={24} />
          </button>
        </div>
        <div className="mobile-nav-scroll-area">
          {mainNavItems.map((item) => {
            const node = menuData[menuKey(item)];
            const hasSubMenu = !!node?.columns?.length;
            const isSubMenuOpen = openSubMenu === menuKey(item);
            return (
              <div key={item.id || item.title} className="mobile-nav-group">
                <button className="mobile-nav-item" onClick={() => handleItemClick(item)}>
                  <span>{item.title}</span>
                  {hasSubMenu && <ChevronRight className={`arrow-icon ${isSubMenuOpen ? "open" : ""}`} />}
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
            </div>
            <div className="header-section right">
              <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
                <Search className="search-icon" />
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
              <Menu size={28} />
            </button>
          </div>
          <nav className="header-bottom desktop-only">
            {mainNavItems.map((item) => (
              <button
                key={item.id || item.title}
                onClick={() => handleNavigate(menuData[menuKey(item)]?.path || item.path || "#")}
                onMouseEnter={() => handleMouseEnter(menuKey(item))}
                onMouseLeave={handleMouseLeave}
                className={`nav-item-bottom ${activeMenu === menuKey(item) ? "active" : ""}`}
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

  /* Cây danh mục nhiều cấp (danh mục → nhóm → mẫu thiệp). Lỗi/backend cũ thì để rỗng, menu dùng headerNav hoặc danh mục dự phòng. */
  const [tree, setTree] = useState<TreeNode[]>([]);
  useEffect(() => {
    templatesApi
      .getTemplateCategoryTree()
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setTree(Array.isArray(d) ? d : []);
      })
      .catch(() => setTree([]));
  }, []);

  const { mainNavItems, menuData } = useMemo(() => {
    const data: Record<string, MenuNode> = {};
    const items: NavItem[] = [];
    const byOrder = (a: NavItem, b: NavItem) => (a.order || 0) - (b.order || 0);
    const visible = (list: NavItem[] | undefined) => (list ?? []).filter((i) => i.isVisible !== false).sort(byOrder);

    /* 1) Menu do admin cấu hình (tab Menu): đây là nguồn duy nhất của thanh menu.
       Cấp 1 = mục chính, cấp 2 = cột trong menu thả xuống, cấp 3 = liên kết trong cột. */
    const nav = visible(settings?.headerNav);
    if (nav.length) {
      nav.forEach((root, i) => {
        const columns: Column[] = visible(root.children).map((col) => ({
          title: col.title,
          path: col.path || root.path || "#",
          links: visible(col.children).map((l) => ({ text: l.title, href: l.path || "#" })),
        }));
        items.push({ id: root.id || root.title, title: root.title, path: root.path || "", order: i + 1, isVisible: true });
        data[menuKey(root)] = { path: root.path || columns[0]?.path || "#", columns };
      });
      return { mainNavItems: items, menuData: data };
    }

    /* 2) Chưa có menu nào: dựng từ cây danh mục mẫu thiệp (hoặc danh mục dự phòng) để trang không trống. */
    const roots: TreeNode[] = tree.length ? tree : FALLBACK_ROOTS.map((f) => rootOf(f.id, f.label));
    const columnOf = (n: TreeNode): Column => {
      const shown = flattenTemplates(n).slice(0, MAX_LINKS);
      const links: Link[] = shown.map((t) => ({ text: t.name, href: `${TEMPLATES}/${t.slug}` }));
      n.children.slice(0, 3).forEach((c) => links.push({ text: `${c.label} ›`, href: c.path }));
      if (n.count > shown.length) links.push({ text: `Xem tất cả (${n.count})`, href: n.path });
      return { title: n.label, path: n.path, links };
    };
    roots.forEach((root, i) => {
      const cols = root.children.map(columnOf);
      if (root.templates.length) cols.unshift(columnOf({ ...root, children: [] }));
      items.push({ id: root.id, title: root.label, path: root.path, order: i + 1, isVisible: true });
      data[root.id] = { path: root.path, columns: cols };
    });

    return { mainNavItems: items, menuData: data };
  }, [settings, tree]);

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
