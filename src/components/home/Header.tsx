"use client";

/* Mã nguồn giữ theo GlobalHeader.js của bản src; CSS nằm ở GlobalHeader.css (cùng tên class). */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronRight, Search, ArrowRight } from "lucide-react";
import { productsApi, settingsApi, templatesApi } from "@/lib/api";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { discountPercent, priceFrom, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/templates";
import { FALLBACK_ROOTS, flattenTemplates, rootOf, type TreeNode } from "@/lib/templates-tree";
import { useAuth } from "@/providers/AuthProvider";
import "./GlobalHeader.css";
import { AnnouncementBar } from "./AnnouncementBar";

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
/* Trang dành cho chuyên nghiệp (nút iPro cạnh logo) */
const IPRO_PATH = "/professional";
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

/* Khối "Cửa hàng" dưới menu: lấy vài sản phẩm thật từ API. Chỉ tải một lần khi mở menu cửa hàng lần đầu. */
let promoCache: Promise<Product[]> | null = null;
function loadPromoProducts(): Promise<Product[]> {
  promoCache ??= productsApi
    .getProducts({ limit: 2 })
    .then((res) => {
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? (d as Product[]).slice(0, 2) : [];
    })
    .catch(() => []);
  return promoCache;
}

const MegaPromo = ({ items, onNavigate }: { items: Product[]; onNavigate: (path: string) => void }) => (
  <div className="mega-promo mega-reveal" style={{ ["--i" as string]: 6 }}>
    <div className="mega-promo-text">
      <p className="mega-promo-eyebrow">Cửa hàng iCards</p>
      <h4 className="mega-promo-title">Cửa hàng &amp; dịch vụ</h4>
      <p className="mega-promo-desc">Phụ kiện trang trí, quà tặng và dịch vụ tổ chức trọn gói cho ngày vui của bạn.</p>
      <button type="button" className="mega-promo-cta" onClick={() => onNavigate(SHOP)}>
        Xem cửa hàng <ArrowRight size={16} aria-hidden />
      </button>
    </div>
    <div className="mega-promo-items">
      {items.map((p) => {
        const from = priceFrom(p);
        const off = discountPercent(p);
        return (
          <a
            key={p.slug}
            href={`${SHOP}/${p.slug}`}
            className="mega-promo-card"
            onClick={(e) => { e.preventDefault(); onNavigate(`${SHOP}/${p.slug}`); }}
          >
            {p.image ? (
              <img src={p.image} alt="" className="mega-promo-thumb mega-promo-img" loading="lazy" />
            ) : (
              <ProductThumb product={p} className="mega-promo-thumb" />
            )}
            <span className="mega-promo-info">
              <b>{p.name}</b>
              <span className="mega-promo-priceRow">
                {off > 0 && <del className="mega-promo-old">{formatPrice(p.compareAtPrice!)}</del>}
                <span className="mega-promo-price">{off > 0 ? "" : "Từ "}{formatPrice(from)}</span>
                {off > 0 && <span className="mega-promo-badge">-{off}%</span>}
              </span>
              <span className="mega-promo-more">Xem sản phẩm <ArrowRight size={14} aria-hidden /></span>
            </span>
          </a>
        );
      })}
    </div>
  </div>
);

const MegaMenuPane = ({ activeKey, activeMenuData, onMouseEnter, onMouseLeave, onClose }: {
  activeKey: string | null; activeMenuData: MenuNode | null; onMouseEnter: () => void; onMouseLeave: () => void; onClose: () => void;
}) => {
  const router = useRouter();
  const isVisible = !!activeMenuData && activeMenuData.columns?.length > 0;
  // Giữ nội dung lần mở gần nhất để animation đóng không bị trống
  const [last, setLast] = useState<{ key: string; data: MenuNode } | null>(null);
  if (isVisible && activeKey && (last?.key !== activeKey || last.data !== activeMenuData)) {
    setLast({ key: activeKey, data: activeMenuData! });
  }
  const shown = isVisible ? { key: activeKey!, data: activeMenuData! } : last;

  const showPromo = isVisible && !!activeMenuData?.path?.startsWith(SHOP);
  const [promoItems, setPromoItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!showPromo) return;
    let alive = true;
    loadPromoProducts().then((items) => { if (alive) setPromoItems(items); });
    return () => { alive = false; };
  }, [showPromo]);

  // Esc để đóng
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isVisible, onClose]);

  const go = (path: string) => { router.push(path); onClose(); };
  const handleLinkClick = (e: React.MouseEvent, path: string) => { e.preventDefault(); go(path); };

  const cols = shown?.data.columns ?? [];
  return (
    <div
      className={`mega-menu-pane ${isVisible ? "visible" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={!isVisible}
      inert={!isVisible}
    >
      <div className="container">
        {shown && (
          <div key={shown.key} className="mega-inner">
            <div className="mega-cols" style={{ ["--cols" as string]: Math.min(cols.length, 5) }}>
              {cols.map((column, index) => (
                <section key={index} className="mega-col mega-reveal" style={{ ["--i" as string]: index }}>
                  <a href={column.path} onClick={(e) => handleLinkClick(e, column.path)} className="mega-col-head">
                    <h3>{column.title}</h3>
                  </a>
                  <ul>
                    {column.links.map((link, i) => (
                      <li key={i}>
                        <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                          <span>{link.text}</span>
                          <ArrowRight className="mega-link-arrow" size={14} aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {showPromo && promoItems.length > 0 && <MegaPromo items={promoItems} onNavigate={go} />}
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

/* ---------- Thanh menu desktop: vừa đủ khung, phần thừa gom vào "Thiệp khác" ---------- */
/* Hai mục luôn đứng cuối menu và không bao giờ bị gom. */
const PINNED_PATHS = ["/shop", "/blog"];
const MORE_LABEL = "Thiệp khác";
/* Chiều rộng dự phòng của nút "Thiệp khác" trước khi đo được */
const MORE_FALLBACK_WIDTH = 120;

const splitNav = (items: NavItem[]) => ({
  cats: items.filter((i) => !PINNED_PATHS.includes(i.path ?? "")),
  pinned: items.filter((i) => PINNED_PATHS.includes(i.path ?? "")),
});

function DesktopNav({ items, menuData, activeMenu, onEnter, onLeave, onClear, onNavigate }: {
  items: NavItem[];
  menuData: Record<string, MenuNode>;
  activeMenu: string | null;
  onEnter: (key: string) => void;
  onLeave: () => void;
  onClear: () => void;
  onNavigate: (path: string) => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  // Chiều rộng đo được của từng mục, giữ lại cả khi mục đó đang bị gom (chiều rộng không đổi theo số mục hiển thị)
  const widths = useRef<Map<string, number>>(new Map());
  const itemEls = useRef<Map<string, HTMLElement>>(new Map());
  const moreWidth = useRef(MORE_FALLBACK_WIDTH);
  const [visible, setVisible] = useState<number>(() => splitNav(items).cats.length);
  const [moreOpen, setMoreOpen] = useState(false);

  const { cats, pinned } = useMemo(() => splitNav(items), [items]);

  // Đo lại và chọn số danh mục hiển thị lớn nhất vừa khung
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const fit = () => {
      itemEls.current.forEach((el, key) => widths.current.set(key, el.getBoundingClientRect().width));
      if (moreRef.current) moreWidth.current = moreRef.current.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(nav).columnGap) || 0;
      const avail = nav.clientWidth;
      const w = (key: string) => widths.current.get(key) ?? 0;
      const pinnedKeys = pinned.map(menuKey);
      const pinnedW = pinnedKeys.reduce((sum, k) => sum + w(k), 0);
      let best = 0;
      for (let k = cats.length; k >= 0; k--) {
        const hasMore = k < cats.length;
        const count = k + (hasMore ? 1 : 0) + pinnedKeys.length;
        const total =
          cats.slice(0, k).reduce((sum, c) => sum + w(menuKey(c)), 0) +
          (hasMore ? moreWidth.current : 0) +
          pinnedW +
          gap * Math.max(0, count - 1);
        if (total <= avail) {
          best = k;
          break;
        }
      }
      setVisible((prev) => (prev === best ? prev : best));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [cats, pinned]);

  const shown = cats.slice(0, visible);
  const hidden = cats.slice(visible);
  const hiddenActive = hidden.some((c) => activeMenu === menuKey(c));

  const btnClass = (key: string) => `nav-item-bottom ${activeMenu === key ? "active" : ""}`;
  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) itemEls.current.set(key, el);
    else itemEls.current.delete(key);
  };

  return (
    <nav ref={navRef} className="header-bottom desktop-only">
      {shown.map((item) => {
        const key = menuKey(item);
        return (
          <button
            key={key}
            ref={register(key)}
            onClick={() => onNavigate(menuData[key]?.path || item.path || "#")}
            onMouseEnter={() => onEnter(key)}
            onMouseLeave={onLeave}
            onFocus={() => onEnter(key)}
            aria-haspopup={menuData[key]?.columns?.length ? "true" : undefined}
            aria-expanded={activeMenu === key}
            className={btnClass(key)}
          >
            {item.title}
          </button>
        );
      })}

      {hidden.length > 0 && (
        <div
          className="more-menu-wrap"
          onMouseEnter={() => { setMoreOpen(true); onClear(); }}
          onMouseLeave={() => setMoreOpen(false)}
        >
          <button ref={moreRef} className={`nav-item-bottom ${hiddenActive ? "active" : ""}`} aria-haspopup="true" aria-expanded={moreOpen}>
            {MORE_LABEL}
          </button>
          {moreOpen && (
            <div className="more-menu" role="menu">
              {hidden.map((item) => {
                const key = menuKey(item);
                return (
                  <button
                    key={key}
                    role="menuitem"
                    onMouseEnter={() => onEnter(key)}
                    onMouseLeave={onLeave}
                    onClick={() => { setMoreOpen(false); onNavigate(menuData[key]?.path || item.path || "#"); }}
                    className={activeMenu === key ? "active" : ""}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pinned.map((item) => {
        const key = menuKey(item);
        return (
          <button
            key={key}
            ref={register(key)}
            onClick={() => onNavigate(menuData[key]?.path || item.path || "#")}
            onMouseEnter={() => onEnter(key)}
            onMouseLeave={onLeave}
            onFocus={() => onEnter(key)}
            aria-haspopup={menuData[key]?.columns?.length ? "true" : undefined}
            aria-expanded={activeMenu === key}
            className={btnClass(key)}
          >
            {item.title}
          </button>
        );
      })}
    </nav>
  );
}

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
  const pathname = usePathname();
  const iproActive = !!pathname?.startsWith(IPRO_PATH);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavigate = (path: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
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

  /* Hover-intent: mở lần đầu trễ ~90ms để lướt chuột qua không bật menu; đang mở thì đổi mục ngay. */
  const handleMouseEnter = (title: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    if (activeMenu) setActiveMenu(title);
    else menuTimeoutRef.current = setTimeout(() => setActiveMenu(title), 90);
  };
  const handleMouseLeave = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 160);
  };
  const closeMenu = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(null);
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
              <span className="logo-divider" aria-hidden="true" />
              <button
                type="button"
                className={`ipro-btn ${iproActive ? "active" : ""}`}
                onClick={() => handleNavigate(IPRO_PATH)}
                aria-current={iproActive ? "page" : undefined}
                aria-label="iPro: trang dành cho chuyên nghiệp"
              >
                iPro
              </button>
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
          <DesktopNav
            items={mainNavItems}
            menuData={menuData}
            activeMenu={activeMenu}
            onEnter={handleMouseEnter}
            onLeave={handleMouseLeave}
            onClear={() => setActiveMenu(null)}
            onNavigate={handleNavigate}
          />
        </div>
        <MegaMenuPane
          activeKey={activeMenu}
          activeMenuData={activeMenu ? menuData[activeMenu] ?? null : null}
          onMouseEnter={() => menuTimeoutRef.current && clearTimeout(menuTimeoutRef.current)}
          onMouseLeave={handleMouseLeave}
          onClose={closeMenu}
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
      {activeMenu && <div className="mega-backdrop" aria-hidden="true" onMouseEnter={() => setActiveMenu(null)} />}
      <MobileNav isOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(false)} menuData={menuData} mainNavItems={mainNavItems} />
    </header>
  );
}