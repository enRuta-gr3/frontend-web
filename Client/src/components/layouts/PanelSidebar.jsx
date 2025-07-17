import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, X, Menu, LogOut } from "lucide-react"

export default function PanelSidebar({
  isMobile,
  toggleSidebar,
  menuItems,
  user,
  panelTitle = "Panel",
  logo = null,
  onLogout,
}) {
  const location = useLocation()
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const isActive = (path) => location.pathname === path

  const toggleSubmenuHandler = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu)
  }

  // Verificamos si el menuItems tiene submenu
  const hasSubmenu = (item) => {
    return item.submenu || item.subMenu
  }

  // Obtenemos los submenus si los tiene 
  const getSubmenu = (item) => {
    return item.submenu || item.subMenu || []
  }

  return (
    <>
      {isMobile && <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar}></div>}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-neutral-900 text-white z-50 transition-transform duration-300 ease-in-out
          ${isMobile ? "w-64 transform translate-x-0" : "w-64 lg:w-72 transform lg:translate-x-0"}
          ${isMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center space-x-3">
              {logo}
              <div>
                <h2 className="font-bold text-white">En Ruta</h2>
                <p className="text-xs text-neutral-400">{panelTitle}</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {hasSubmenu(item) ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenuHandler(item.title)}
                        className={`
                          flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium
                          ${isActive(item.path) ? "bg-orange-500 text-white" : "text-neutral-300 hover:bg-neutral-800"}
                        `}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openSubmenu === item.title ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openSubmenu === item.title && (
                        <ul className="mt-1 ml-4 pl-3 border-l border-neutral-800 space-y-1">
                          {getSubmenu(item).map((subitem, subindex) => (
                            <li key={subindex}>
                              <Link
                                to={subitem.path}
                                className={`
                                  flex items-center px-3 py-2 rounded-lg text-sm
                                  ${isActive(subitem.path) ? "text-orange-500 font-medium" : "text-neutral-400 hover:text-white"}
                                `}
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium
                        ${isActive(item.path) ? "bg-orange-500 text-white" : "text-neutral-300 hover:bg-neutral-800"}
                      `}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.initials || user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-neutral-400">{user?.email || user?.role || ""}</p>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 text-neutral-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-orange-500 text-white p-2 rounded-full shadow-lg lg:hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  )
}
