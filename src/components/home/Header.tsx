"use client";

/* Mã nguồn giữ theo GlobalHeader.js của bản src; CSS nằm ở GlobalHeader.css (cùng tên class). */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronRight, Search, ArrowRight, Sparkles, Send, Headset } from "lucide-react";
import { productsApi, settingsApi, templatesApi } from "@/lib/api";
import { ProductThumb } from "@/components/shop/ProductThumb";
import { discountPercent, priceFrom, type Product } from "@/lib/shop";
import { formatPrice } from "@/lib/templates";
import { FALLBACK_ROOTS, flattenTemplates, rootOf, type TreeNode } from "@/lib/templates-tree";
import { useAuth } from "@/providers/AuthProvider";
import "./GlobalHeader.css";
import { AnnouncementBar } from "./AnnouncementBar";
import { BrandLogo } from "@/components/brand/BrandLogo";

/* ---------- Kiểu & tiện ích ---------- */
type Link = { text: string; href: string };
type Column = { title: string; path: string; links: Link[] };
/* Mẫu thiệp gợi ý hiển thị ở nửa dưới của menu thả xuống (lấy từ cây danh mục). */
type Featured = { slug: string; name: string; image?: string | null };
type MenuNode = { path: string; columns: Column[]; title?: string; featured?: Featured[] };
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
/* Khoảng đệm trên + dưới của phần danh mục (khớp .mega-inner > .mega-top trong CSS). */
const MEGA_TOP_PAD = 68;

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
      <button className="avatar-button" onClick={() => setIsOpen(!isOpen)} aria-haspopup="menu" aria-expanded={isOpen} aria-label={`Tài khoản ${name}`}>
        {initial}
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
    .getProducts({ limit: 6 })
    .then((res) => {
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? (d as Product[]).slice(0, 6) : [];
    })
    .catch(() => []);
  return promoCache;
}

/* Dải dưới menu cửa hàng: tiêu đề nhỏ + "Xem tất cả", lưới sản phẩm (không hiển thị nếu chưa có sản phẩm). */
const MegaPromo = ({ items, onNavigate }: { items: Product[]; onNavigate: (path: string) => void }) => {
  if (items.length === 0) return null;
  return (
    <div className="mega-band mega-reveal" style={{ ["--i" as string]: 5 }}>
      <div className="container">
        <div className="mega-band-head">
          <p className="mega-band-label">Sản phẩm nổi bật</p>
          <a href={SHOP} className="mega-band-more" onClick={(e) => { e.preventDefault(); onNavigate(SHOP); }}>
            Xem tất cả <ArrowRight size={14} aria-hidden />
          </a>
        </div>
        <div className="mega-tiles mega-tiles-shop">
          {items.slice(0, 4).map((p) => {
            const from = priceFrom(p);
            const off = discountPercent(p);
            return (
              <a
                key={p.slug}
                href={`${SHOP}/${p.slug}`}
                className="mega-tile"
                onClick={(e) => { e.preventDefault(); onNavigate(`${SHOP}/${p.slug}`); }}
              >
                <span className="mega-tile-media">
                  {p.image ? (
                    <img src={p.image} alt="" className="mega-tile-img" loading="lazy" />
                  ) : (
                    <ProductThumb product={p} className="mega-tile-img" />
                  )}
                  {off > 0 && <span className="mega-promo-badge mega-tile-badge">-{off}%</span>}
                </span>
                <span className="mega-tile-info">
                  <b>{p.name}</b>
                  <span className="mega-promo-priceRow">
                    {off > 0 && <del className="mega-promo-old">{formatPrice(p.compareAtPrice!)}</del>}
                    <span className="mega-promo-price">{off > 0 ? "" : "Từ "}{formatPrice(from)}</span>
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Dải dưới của menu danh mục thiệp: ba thẻ hành động giúp người dùng bắt đầu nhanh, lấp khoảng trống dưới phần danh mục. */
const MegaFooter = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const cards = [
    { key: "start", tone: "primary", icon: Sparkles, eyebrow: "Bắt đầu nhanh", title: "Tự thiết kế thiệp trong vài phút", desc: "Đổi chữ, ảnh, màu và nhạc ngay trên trình chỉnh sửa online.", cta: "Chọn mẫu", path: TEMPLATES },
    { key: "send", tone: "light", icon: Send, eyebrow: "Gửi & theo dõi", title: "Gửi thiệp, quản lý khách mời", desc: "Chia sẻ link qua Zalo, Messenger hoặc email và xem ai đã mở thiệp.", cta: "Quản lí thiệp", path: "/invitation-management" },
    { key: "help", tone: "light", icon: Headset, eyebrow: "Cần làm riêng?", title: "Nhờ đội ngũ thiết kế", desc: "Thiệp theo yêu cầu riêng về bố cục, phong cách và thời gian gấp.", cta: "Liên hệ tư vấn", path: "/contact" },
  ];
  return (
    <div className="mega-foot mega-reveal" style={{ ["--i" as string]: 4 }}>
      <div className="container">
        <div className="mega-foot-grid">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.key}
                href={c.path}
                className={`mega-foot-card mega-foot-${c.tone}`}
                onClick={(e) => { e.preventDefault(); onNavigate(c.path); }}
              >
                <span className="mega-foot-icon" aria-hidden><Icon size={20} /></span>
                <span className="mega-foot-eyebrow">{c.eyebrow}</span>
                <span className="mega-foot-title">{c.title}</span>
                <span className="mega-foot-desc">{c.desc}</span>
                <span className="mega-foot-cta">{c.cta} <ArrowRight size={15} aria-hidden /></span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Nút "Xem thêm" cuối cột: các mục còn lại hiện ra thành popup bên cạnh khi hover (không làm cột dài thêm). */
const MegaMore = ({ links, title, openLeft, onNavigate }: { links: Link[]; title: string; openLeft: boolean; onNavigate: (path: string) => void }) => (
  <li className="mega-more">
    <button type="button" className="mega-more-btn">
      <span>Xem thêm ({links.length})</span>
      <ChevronRight size={15} aria-hidden />
    </button>
    <div className={`mega-more-pop${openLeft ? " is-left" : ""}`}>
      <p className="mega-more-title">{title}</p>
      <ul>
        {links.map((link, i) => (
          <li key={i}>
            <a href={link.href} onClick={(e) => { e.preventDefault(); onNavigate(link.href); }}>
              <span>{link.text}</span>
              <ArrowRight className="mega-link-arrow" size={14} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  </li>
);

/* Pane "Thiệp khác": mỗi danh mục bị gom là một khối, khối lẻ có phần giới thiệu bên trái, khối chẵn đảo lại bên phải. Cuộn được. */
const MegaZigzag = ({ blocks, onNavigate }: { blocks: MenuNode[]; onNavigate: (path: string) => void }) => (
  <div className="container mega-zig-list">
    {blocks.map((b, i) => (
      <section key={`${b.path}-${i}`} className={`mega-zig mega-reveal ${i % 2 === 1 ? "is-reverse" : ""}`} style={{ ["--i" as string]: Math.min(i, 6) }}>
        <aside className="mega-zig-intro">
          <p className="mega-intro-eyebrow">Danh mục</p>
          <h2 className="mega-intro-title">{b.title}</h2>
          <p className="mega-intro-desc">Khám phá mẫu thiệp theo phong cách, dịp và nhu cầu của bạn.</p>
          <button type="button" className="mega-intro-cta" onClick={() => onNavigate(b.path)}>
            Xem tất cả <ArrowRight size={15} aria-hidden />
          </button>
        </aside>
        <div className="mega-cols mega-zig-cols">
          {b.columns.map((column, index) => (
            <div key={index} className="mega-col">
              <a href={column.path} onClick={(e) => { e.preventDefault(); onNavigate(column.path); }} className="mega-col-head">
                <h3>{column.title}</h3>
              </a>
              <ul>
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} onClick={(e) => { e.preventDefault(); onNavigate(link.href); }}>
                      <span>{link.text}</span>
                      <ArrowRight className="mega-link-arrow" size={14} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const MegaMenuPane = ({ activeKey, activeMenuData, zigzag, onMouseEnter, onMouseLeave, onClose }: {
  activeKey: string | null; activeMenuData: MenuNode | null; zigzag: MenuNode[]; onMouseEnter: () => void; onMouseLeave: () => void; onClose: () => void;
}) => {
  const isMore = activeKey === MORE_KEY;
  const router = useRouter();
  const paneRef = useRef<HTMLDivElement>(null);
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

  // Đo mép trên của khung (ngay dưới thanh header) để khung cao đúng tới đáy màn hình: không hở trang bên dưới.
  useLayoutEffect(() => {
    if (!isVisible) return;
    const el = paneRef.current;
    if (!el) return;
    const measure = () => el.style.setProperty("--mega-top", `${Math.max(0, el.getBoundingClientRect().top)}px`);
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [isVisible]);

  // Đo chiều cao còn trống để tính số mục tối đa mỗi cột: phần thừa đưa vào nút "Xem thêm", menu không bao giờ phải cuộn.
  const [maxRows, setMaxRows] = useState<number | null>(null);
  const shownKey = shown?.key;
  const shownData = shown?.data;
  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!isVisible || !pane || isMore) return;
    const fit = () => {
      const head = pane.querySelector<HTMLElement>(".mega-col-head");
      const row = pane.querySelector<HTMLElement>(".mega-col > ul > li");
      if (!head || !row) { setMaxRows(null); return; }
      const inner = pane.querySelector(".mega-inner");
      const below = Array.from(inner?.children ?? [])
        .filter((el) => !el.classList.contains("mega-top"))
        .reduce((h, el) => h + (el as HTMLElement).offsetHeight, 0);
      const innerH = pane.clientHeight - below - MEGA_TOP_PAD;
      const rowH = row.offsetHeight || 40;
      setMaxRows(Math.max(4, Math.floor((innerH - head.offsetHeight - 14) / rowH)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [isVisible, shownKey, shownData, isMore]);

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
      ref={paneRef}
      className={`mega-menu-pane ${isVisible ? "visible" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={!isVisible}
      inert={!isVisible}
    >
      {shown && (
        <div key={shown.key} className="mega-inner">
          {isMore ? (
            <MegaZigzag blocks={zigzag} onNavigate={go} />
          ) : (
          <div className="container mega-top">
            <div className="mega-layout">
            <aside className="mega-intro mega-reveal" style={{ ["--i" as string]: 0 }}>
              <p className="mega-intro-eyebrow">{showPromo ? "Mua sắm" : "Danh mục"}</p>
              <h2 className="mega-intro-title">{shown.data.title}</h2>
              <p className="mega-intro-desc">
                {showPromo
                  ? "Phụ kiện trang trí, quà tặng và dịch vụ tổ chức trọn gói cho ngày vui."
                  : "Khám phá mẫu thiệp theo phong cách, dịp và nhu cầu của bạn."}
              </p>
              <button type="button" className="mega-intro-cta" onClick={() => go(shown.data.path)}>
                Xem tất cả <ArrowRight size={15} aria-hidden />
              </button>
            </aside>
            <div className="mega-cols">
              {cols.map((column, index) => {
                const limit = maxRows ?? Infinity;
                const more = column.links.length > limit;
                const visibleLinks = more ? column.links.slice(0, Math.max(1, limit - 1)) : column.links;
                const hiddenLinks = more ? column.links.slice(visibleLinks.length) : [];
                return (
                  <section key={index} className="mega-col mega-reveal" style={{ ["--i" as string]: index }}>
                    <a href={column.path} onClick={(e) => handleLinkClick(e, column.path)} className="mega-col-head">
                      <h3>{column.title}</h3>
                    </a>
                    <ul>
                      {visibleLinks.map((link, i) => (
                        <li key={i}>
                          <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                            <span>{link.text}</span>
                            <ArrowRight className="mega-link-arrow" size={14} aria-hidden />
                          </a>
                        </li>
                      ))}
                      {more && (
                        <MegaMore links={hiddenLinks} title={column.title} openLeft={index === cols.length - 1} onNavigate={go} />
                      )}
                    </ul>
                  </section>
                );
              })}
            </div>
            </div>
          </div>
          )}
          {showPromo ? (
            <MegaPromo items={promoItems} onNavigate={go} />
          ) : (
            <MegaFooter onNavigate={go} />
          )}
        </div>
      )}
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
/* Khóa pane gộp của nút "Thiệp khác": hiện toàn bộ danh mục bị gom, xếp zigzag và cuộn được */
const MORE_KEY = "__more__";
/* Dữ liệu giả để MegaMenuPane mở đúng khi ở pane gộp (nội dung thật lấy từ danh sách danh mục bị gom) */
const MORE_DATA: MenuNode = { path: "/templates", title: MORE_LABEL, columns: [{ title: MORE_LABEL, path: "/templates", links: [] }] };
/* Chiều rộng dự phòng của nút "Thiệp khác" trước khi đo được */
const MORE_FALLBACK_WIDTH = 120;

const splitNav = (items: NavItem[]) => ({
  cats: items.filter((i) => !PINNED_PATHS.includes(i.path ?? "")),
  pinned: items.filter((i) => PINNED_PATHS.includes(i.path ?? "")),
});

function DesktopNav({ items, menuData, activeMenu, onEnter, onLeave, onClear, onNavigate, onOverflow }: {
  items: NavItem[];
  menuData: Record<string, MenuNode>;
  activeMenu: string | null;
  onEnter: (key: string) => void;
  onLeave: () => void;
  onClear: () => void;
  onNavigate: (path: string) => void;
  onOverflow: (items: NavItem[]) => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  // Chiều rộng đo được của từng mục, giữ lại cả khi mục đó đang bị gom (chiều rộng không đổi theo số mục hiển thị)
  const widths = useRef<Map<string, number>>(new Map());
  const itemEls = useRef<Map<string, HTMLElement>>(new Map());
  const moreWidth = useRef(MORE_FALLBACK_WIDTH);
  const [visible, setVisible] = useState<number>(() => splitNav(items).cats.length);

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
  // Báo danh sách mục bị gom lên để pane "Thiệp khác" hiện đủ các danh mục đó
  const hiddenKey = hidden.map(menuKey).join("|");
  useEffect(() => { onOverflow(hidden); }, [hiddenKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <button
          ref={moreRef}
          type="button"
          className={`nav-item-bottom ${activeMenu === MORE_KEY ? "active" : ""}`}
          aria-haspopup="true"
          aria-expanded={activeMenu === MORE_KEY}
          onMouseEnter={() => onEnter(MORE_KEY)}
          onMouseLeave={onLeave}
          onFocus={() => onEnter(MORE_KEY)}
        >
          {MORE_LABEL}
        </button>
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
  // Các mục đang bị gom vào "Thiệp khác" và dữ liệu menu của từng mục (để hiện zigzag)
  const [overflow, setOverflow] = useState<NavItem[]>([]);
  const moreBlocks = useMemo(
    () => overflow.map((i) => menuData[menuKey(i)]).filter((n): n is MenuNode => !!n?.columns?.length),
    [overflow, menuData],
  );

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
    // Mục không có menu thả xuống (vd "Cửa hàng & dịch vụ" chưa cấu hình cột): không mở gì, và đóng menu đang mở nếu có
    const hasPane = title === MORE_KEY ? moreBlocks.length > 0 : !!menuData[title]?.columns?.length;
    if (!hasPane) {
      if (activeMenu) setActiveMenu(null);
      return;
    }
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
                {logoUrl ? <img src={logoUrl} alt={companyName} /> : <BrandLogo name={companyName} />}
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
                <Search className="search-icon" aria-hidden />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm sản phẩm, mẫu thiệp"
                  aria-label="Tìm sản phẩm, mẫu thiệp"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-submit" aria-label="Tìm kiếm">
                  <ArrowRight size={16} aria-hidden />
                </button>
              </form>
              {isAuthenticated && user ? (
                <UserMenu name={user.name} email={user.email} initial={(user.name || "A").charAt(0).toUpperCase()} onLogout={logout} />
              ) : (
                <div className="auth-actions">
                  <button type="button" className="auth-btn auth-btn-outline" onClick={() => handleNavigate("/sign-in")}>Đăng nhập</button>
                  <button type="button" className="auth-btn auth-btn-solid" onClick={() => handleNavigate("/sign-up")}>Đăng ký</button>
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
            onOverflow={setOverflow}
          />
        </div>
        <MegaMenuPane
          activeKey={activeMenu}
          activeMenuData={activeMenu === MORE_KEY ? (moreBlocks.length ? MORE_DATA : null) : activeMenu ? menuData[activeMenu] ?? null : null}
          zigzag={moreBlocks}
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

    /* Mẫu thiệp gợi ý cho nửa dưới menu: tìm danh mục gốc trong cây theo ?category= của đường dẫn, không có thì theo tên. */
    const norm = (v: string) => v.trim().toLowerCase();
    const featuredOf = (path: string | undefined, title: string): Featured[] => {
      const q = path?.split("?")[1];
      const cat = q ? new URLSearchParams(q).get("category") : null;
      const node = tree.find((r) => (cat && r.id === cat) || norm(r.label) === norm(title));
      if (!node) return [];
      return flattenTemplates(node)
        .filter((t) => t.previewImage)
        .slice(0, 8)
        .map((t) => ({ slug: t.slug, name: t.name, image: t.previewImage }));
    };

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
        data[menuKey(root)] = { path: root.path || columns[0]?.path || "#", columns, title: root.title, featured: featuredOf(root.path, root.title) };
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
      data[root.id] = { path: root.path, columns: cols, title: root.label, featured: featuredOf(root.path, root.label) };
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
      {activeMenu && (activeMenu === MORE_KEY || !!menuData[activeMenu]?.columns?.length) && <div className="mega-backdrop" aria-hidden="true" onMouseEnter={() => setActiveMenu(null)} />}
      <MobileNav isOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(false)} menuData={menuData} mainNavItems={mainNavItems} />
    </header>
  );
}