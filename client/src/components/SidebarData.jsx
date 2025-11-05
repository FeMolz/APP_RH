import { FaGraduationCap, FaTools, FaHome, FaUsers, FaBriefcase } from 'react-icons/fa';

const SidebarData = [
  { title: 'Dashboard', path: '/', icon: FaHome },
  { title: 'Funcionários', path: '/funcionarios', icon: FaUsers },  
  { title: 'Cargos', path: '/cargos', icon: FaBriefcase },
  { title: 'Formações', path: '/formacoes', icon: FaGraduationCap },
  { title: 'EPIs', path: '/epis', icon: FaTools },
];

export default SidebarData;
