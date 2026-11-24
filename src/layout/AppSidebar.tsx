import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
  ListIcon,
} from "../icons";
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

// --- KOMPONEN LOGO SMART-PROLANIS ---
const SmartProlanisLogoFull = () => (
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-lg shadow-md flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[1.15rem] font-black leading-none text-gray-800 dark:text-white tracking-tight">Smart</span>
      <span className="text-[0.6rem] font-bold tracking-[0.2em] text-brand-500 dark:text-brand-400">PROLANIS</span>
    </div>
  </div>
);

const SmartProlanisLogoIcon = () => (
  <div className="flex items-center justify-center w-8 h-8 bg-brand-500 rounded-lg shadow-md flex-shrink-0 transition-all duration-300">
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
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
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  // Fungsi pengecekan hak akses (Role)
  const hasAccess = (allowedRoles?: number[]) => {
    if (!allowedRoles) return true; 
    if (!user) return false; 
    if (user.role === 6) return true; // PIC otomatis akses semua
    return allowedRoles.includes(user.role);
  };

  // KITA BUAT MENU DINAMIS BERDASARKAN USER YANG LOGIN
  const navItems: NavItem[] = useMemo(() => {
    // Tentukan nama dashboard berdasarkan role
    let dashboardName = "Dashboard Utama";
    if (user?.role === 2) dashboardName = "Dashboard Perawat";
    // Anda bisa tambahkan kondisi lain kelak, contoh:
    else if (user?.role === 1) dashboardName = "Dashboard Dokter";
    else if (user?.role === 3) dashboardName = "Dashboard Ahli Gizi";
    else if (user?.role === 4) dashboardName = "Dashboard Apoteker";

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
            name: "Data Pengguna",
            path: "/data-pengguna",
            pro: false,
            allowedRoles: [6], // Hanya PIC (6)
          },
          {
            name: "Peserta Prolanis",
            path: "/peserta-prolanis",
            pro: false,
            allowedRoles: [5, 6], // Administrasi (5) dan PIC (6)
          },
          {
            name: "Jadwal Kegiatan",
            path: "/jadwal-kegiatan",
            pro: false,
            allowedRoles: [5, 6],
          },
          {
            name: "Data Pangan Lokal",
            path: "/pangan-lokal",
            pro: false,
            allowedRoles: [3, 6], // Ahli Gizi (3) dan PIC (6)
          },
        ],
      },
      // Menu Pemeriksaan telah Dihapus Total
      {
        icon: <ListIcon />,
        name: "Arsip",
        subItems: [
          {
            name: "Arsip Kegiatan",
            path: "/arsip-kegiatan",
            pro: false,
            allowedRoles: [5, 6],
          },

          {
            name: "Arsip Pemerikasaan",
            path: "/arsip-pemeriksaan",
            pro: false,
            allowedRoles: [1,2,3,6], 
          },
        ],
      },
    ];
  }, [user]); // Menu akan di-render ulang jika data user berubah

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
    const accessibleItems = items.filter((item) => hasAccess(item.allowedRoles));

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
            <SmartProlanisLogoFull />
          ) : (
            <SmartProlanisLogoIcon />
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