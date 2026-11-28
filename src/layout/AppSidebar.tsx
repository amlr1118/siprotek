import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { ChevronDownIcon, GridIcon, HorizontaLDots, TableIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

// Tipe NavItem dengan tambahan allowedRoles
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  allowedRoles?: number[];
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    allowedRoles?: number[];
  }[];
};

// --- IKON SVG PERISAI K3 SIPROTEK ---
const SiprotekShieldSvg = ({ clipId }: { clipId: string }) => (
  <svg
    viewBox="0 0 200 220"
    className="w-full h-full"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id={clipId}>
        <path d="M100 10 L176 34 V104 C176 156 142 192 100 210 C58 192 24 156 24 104 V34 L100 10 Z" />
      </clipPath>
    </defs>

    {/* Perisai Hijau K3 */}
    <path
      d="M100 10 L176 34 V104 C176 156 142 192 100 210 C58 192 24 156 24 104 V34 L100 10 Z"
      fill="#378E43"
    />

    {/* Palang Medis Putih */}
    <path
      d="M86 42 H114 V68 H140 V96 H114 V122 H86 V96 H60 V68 H86 V42 Z"
      fill="#FFFFFF"
    />

    {/* Roda Gigi Putih */}
    <g clipPath={`url(#${clipId})`}>
      <g fill="#FFFFFF">
        <rect x="91" y="132" width="18" height="22" rx="3" />
        <rect
          x="91"
          y="132"
          width="18"
          height="22"
          rx="3"
          transform="rotate(36 100 182)"
        />
        <rect
          x="91"
          y="132"
          width="18"
          height="22"
          rx="3"
          transform="rotate(72 100 182)"
        />
        <rect
          x="91"
          y="132"
          width="18"
          height="22"
          rx="3"
          transform="rotate(-36 100 182)"
        />
        <rect
          x="91"
          y="132"
          width="18"
          height="22"
          rx="3"
          transform="rotate(-72 100 182)"
        />
      </g>
      <circle cx="100" cy="182" r="40" fill="#FFFFFF" />
      <circle cx="100" cy="182" r="21" fill="#378E43" />
    </g>
  </svg>
);

// --- KOMPONEN LOGO SIPROTEK FULL (SIDEBAR TERBUKA) ---
const SiprotekLogoFull = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-1 flex-shrink-0">
      <SiprotekShieldSvg clipId="siprotek-sidebar-full-clip" />
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[1.15rem] font-black leading-none text-gray-800 dark:text-white tracking-wider">
        SIPROTEK
      </span>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#378E43] dark:text-emerald-400 mt-1">
        K3RS RSUD Busel
      </span>
    </div>
  </div>
);

// --- KOMPONEN LOGO SIPROTEK ICON (SIDEBAR TERTUTUP / COLLAPSED) ---
const SiprotekLogoIcon = () => (
  <div className="flex items-center justify-center w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-1 flex-shrink-0 transition-all duration-300">
    <SiprotekShieldSvg clipId="siprotek-sidebar-icon-clip" />
  </div>
);

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  // Fungsi pengecekan hak akses (Role)
  const hasAccess = (allowedRoles?: number[]) => {
    if (!allowedRoles) return true;
    if (!user) return false;
    if (user.role === 6) return true;
    return allowedRoles.includes(user.role);
  };

  // MENU DINAMIS BERDASARKAN USER YANG LOGIN
  const navItems: NavItem[] = useMemo(() => {
    let dashboardName = "Dashboard Utama";
    if (user?.role === 1) dashboardName = "Dashboard Super Admin";
    else if (user?.role === 2) dashboardName = "Dashboard Manajemen RS";
    else if (user?.role === 3) dashboardName = "Dashboard Komite K3RS";
    else if (user?.role === 4) dashboardName = "Dashboard Nakes & Staf";

    return [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        subItems: [{ name: dashboardName, path: "/", pro: false }],
      },
      {
        name: "Master Data",
        icon: <TableIcon />,
        subItems: [
          {
            name: "Pengguna",
            path: "/data-pengguna",
            pro: false,
            allowedRoles: [6, 1],
          },
          {
            name: "Unit Kerja",
            path: "/unit-kerja",
            pro: false,
            allowedRoles: [1],
          },
          {
            name: "Dimensi Bahaya",
            path: "/dimensi-bahaya",
            pro: false,
            allowedRoles: [1],
          },
          {
            name: "Kategori Resiko",
            path: "/kategori-resiko",
            pro: false,
            allowedRoles: [1],
          },
          {
            name: "Hierarki Niosh",
            path: "/hierarki-niosh",
            pro: false,
            allowedRoles: [1],
          },
          {
            name: "Aturan K3",
            path: "/aturan-k3",
            pro: false,
            allowedRoles: [1],
          },
        ],
      },
    ];
  }, [user]);

  const othersItems: NavItem[] = [];

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    const accessibleItems = items.filter((item) =>
      hasAccess(item.allowedRoles),
    );

    return (
      <ul className="flex flex-col gap-4">
        {accessibleItems.map((nav, index) => {
          const accessibleSubItems = nav.subItems?.filter((sub) =>
            hasAccess(sub.allowedRoles),
          );

          if (
            nav.subItems &&
            (!accessibleSubItems || accessibleSubItems.length === 0)
          ) {
            return null;
          }

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`menu-item group ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {accessibleSubItems?.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="outline-none">
          {isExpanded || isHovered || isMobileOpen ? (
            <SiprotekLogoFull />
          ) : (
            <SiprotekLogoIcon />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Bagian Menu Utama */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Bagian Menu Lainnya (Hanya muncul jika ada isinya) */}
            {othersItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Lainnya"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
