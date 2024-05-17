import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label, onClick }) => {
  return (
    <div>
      <Link href={href}>
        <button onClick={onClick} className="flex space-x-4 hover:bg-tertiary/30 hover:pr-24 transition-all ease-in-out hover:duration-350 rounded-full px-4 py-2">
          <div className="pt-0.5 pr-2">{icon}</div>
          {label}
        </button>
      </Link>
    </div>
  );
};

export default SidebarLink;