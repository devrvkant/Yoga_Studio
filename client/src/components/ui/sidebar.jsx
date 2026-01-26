import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const SidebarContext = createContext(null);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}

export function SidebarProvider({ children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    // Check for mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setOpen(false);
            } else {
                // Auto-open on desktop unless explicitly closed? 
                // For now, let's respect the default or manual toggle
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-collapse logic for player pages
    useEffect(() => {
        // Matches /dashboard/my-courses/:id or /dashboard/my-classes/:id (but not the list pages)
        // We need to be careful not to collapse on /dashboard/my-courses (list)
        // logic: if path has 4 segments e.g. /dashboard/my-courses/123
        const isPlayerPage = location.pathname.match(/^\/dashboard\/my-(courses|classes)\/[^/]+$/);

        if (isPlayerPage && !isMobile) {
            setOpen(false);
        } else if (!isMobile) {
            // Optional: Auto-open when leaving player page? 
            // The user said: "auto opened states for best user experience - ... when not use"
            // So yes, let's auto-open if we are NOT on a player page.
            setOpen(true);
        }
    }, [location.pathname, isMobile]);

    return (
        <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
            <div className="flex h-screen bg-background w-full overflow-hidden">
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

export function Sidebar({ children, className }) {
    const { open, isMobile } = useSidebar();

    return (
        <aside
            className={cn(
                "h-full bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col relative",
                open ? "w-64" : "w-[70px]",
                isMobile && (open ? "absolute z-50 left-0 top-0 w-64 shadow-2xl" : "hidden"),
                className
            )}
        >
            {children}
        </aside>
    );
}

export function SidebarHeader({ children, className }) {
    const { open } = useSidebar();
    return (
        <div className={cn("flex items-center p-4 h-16 border-b border-border/50 overflow-hidden", className)}>
            {children}
        </div>
    );
}

export function SidebarContent({ children, className }) {
    return (
        <div className={cn("flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1", className)}>
            {children}
        </div>
    );
}

export function SidebarFooter({ children, className }) {
    return (
        <div className={cn("p-2 border-t border-border/50", className)}>
            {children}
        </div>
    );
}


export function SidebarTrigger({ className }) {
    const { open, setOpen } = useSidebar();
    return (
        <button
            onClick={() => setOpen(!open)}
            className={cn("p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors", className)}
        >
            {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
    );
}

export function SidebarItem({ icon: Icon, label, to, isActive, onClick, className }) {
    const { open } = useSidebar();
    const [showTooltip, setShowTooltip] = useState(false);

    const content = (
        <div
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group w-full cursor-pointer overflow-hidden",
                isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !open && "justify-center px-2",
                className
            )}
            onMouseEnter={() => !open && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {Icon && <Icon size={20} className="shrink-0" />}

            <span className={cn(
                "truncate transition-all duration-300 origin-left",
                open ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 w-0 hidden"
            )}>
                {label}
            </span>

            {!open && showTooltip && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200 border border-border">
                    {label}
                </div>
            )}
        </div>
    );

    if (to) {
        return (
            <Link to={to} className="w-full block" onClick={onClick}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="w-full block text-left bg-transparent border-0 p-0">
            {content}
        </button>
    );
}
