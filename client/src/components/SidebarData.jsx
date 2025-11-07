import { FaGraduationCap, FaTools, FaFolder, FaHome, FaUsers, FaBriefcase, FaWallet } from 'react-icons/fa';
import { BsFillPersonPlusFill, BsGraphUpArrow } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import { BsClipboard2PulseFill } from "react-icons/bs";

const SidebarData = [
  { title: 'Dashboard', path: '/home', icon: FaHome },  
  { title: 'Cadastros', path: '/cadastros', icon: BsFillPersonPlusFill },  
  { title: 'Entrega EPIs', path: '/entregas', icon: FaTools },
  { title: 'Avaliação', path: '/avaliacao', icon: BsClipboard2PulseFill },
  { title: 'Pagamentos', path: '/pagamentos', icon: FaWallet },
  { title: 'Documentos', path: '/docs', icon: IoDocumentText },
  { title: 'Anexos', path: '/anexos', icon: FaFolder },
];

export default SidebarData;
