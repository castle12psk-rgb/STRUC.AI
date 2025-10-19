import React from 'react';
// FIX: Changed import paths to be relative.
import { Mode } from '../types';
import { USER_MENU, ADMIN_MENU } from '../constants';

interface SidebarProps {
  mode: Mode;
  activeView: string;
  setActiveView: (view: string) => void;
  toggleMode: () => void;
  projects: { id: string; name: string }[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mode, activeView, setActiveView, toggleMode, projects, selectedProjectId, setSelectedProjectId }) => {
  const menuItems = mode === 'user' ? USER_MENU : ADMIN_MENU;

  const NavItem: React.FC<{
    label: string;
    subItems?: string[];
    // FIX: Changed React.ReactElement to React.ReactElement<any> to allow passing className prop via cloneElement.
    icon: React.ReactElement<any>;
  }> = ({ label, subItems, icon }) => {
    const isActive = activeView.startsWith(label);
    const iconColor = isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white';
    
    return (
      <div>
        <button
          onClick={() => setActiveView(subItems && subItems.length > 0 ? `${label} > ${subItems[0]}` : label)}
          className={`w-full flex items-center justify-start text-left px-4 py-2.5 text-base font-medium rounded-lg transition-colors duration-200 group ${
            isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {React.cloneElement(icon, { className: `h-5 w-5 ${iconColor}` })}
          <span className="ml-3">{label}</span>
        </button>
        {isActive && subItems && subItems.length > 0 && (
          <div className="pl-8 mt-2 space-y-1">
            {subItems.map(subItem => {
              const fullViewName = `${label} > ${subItem}`;
              return (
                <button
                  key={subItem}
                  onClick={() => setActiveView(fullViewName)}
                  className={`w-full text-left block px-4 py-1.5 text-sm rounded-md ${
                    activeView === fullViewName ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-indigo-400'
                  }`}
                >
                  {subItem}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const Icons = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Reports: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    SHM: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
    QA: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    Project: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>,
    Admin: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="px-4 py-5 flex items-center border-b border-slate-700">
        <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="ml-2 text-xl font-bold tracking-wider text-white">STRUC.AI</h1>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="project-select" className="text-xs text-slate-400">프로젝트</label>
          <select 
            id="project-select" 
            className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md text-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {mode === 'user' && <option value="ALL_PROJECTS">전체 프로젝트</option>}
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex bg-slate-900 rounded-md p-1">
          <button onClick={mode === 'admin' ? toggleMode : undefined} className={`w-1/2 py-1 text-sm rounded ${mode === 'user' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>User</button>
          <button onClick={mode === 'user' ? toggleMode : undefined} className={`w-1/2 py-1 text-sm rounded ${mode === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Admin</button>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-2">
        {Object.entries(menuItems).map(([label, subItems]) => (
          <NavItem 
            key={label} 
            label={label} 
            subItems={subItems}
            icon={
              label.includes('대시보드') ? Icons.Dashboard :
              label.includes('리포트') ? Icons.Reports :
              label.includes('SHM') ? Icons.SHM :
              label.includes('QA') ? Icons.QA :
              label.includes('프로젝트') ? Icons.Project : Icons.Admin
            }
          />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700">
        <p className="text-xs text-white font-bold text-center">
          ⓒ OSANGTECH. all rights reserved.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;